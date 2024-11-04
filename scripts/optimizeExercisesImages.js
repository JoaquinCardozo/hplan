const { sql } = require('@vercel/postgres');
const fetch = require('node-fetch');
const { S3Client, PutObjectCommand, ObjectCannedACL } = require('@aws-sdk/client-s3');
const { spawn } = require('child_process');

async function optimizeGif(buffer) {
  const gifsicle = await import('gifsicle');
  return new Promise((resolve, reject) => {
    const command = gifsicle.default;
    const args = [
        '--optimize=3', 
        '--lossy=40',
        '--resize', '320x180'
    ];
    const gifProcess = spawn(command, args);

    gifProcess.stdin.write(buffer);
    gifProcess.stdin.end();

    let optimizedBuffer = [];

    gifProcess.stdout.on('data', (data) => {
      optimizedBuffer.push(data);
    });

    gifProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`gifsicle exited with code ${code}`));
      }
      resolve(Buffer.concat(optimizedBuffer));
    });

    gifProcess.on('error', reject);
  });
}

async function migrateImages() {
  try {
    const result = await sql`
      SELECT id, name, image_url 
      FROM exercises 
      WHERE image_url IS NOT NULL AND image_url LIKE '%vercel%'`;
    const exercises = result.rows;
    const directory = 'exercise_images';

    for (const exercise of exercises) {
      let { id, name, image_url } = exercise;
      name = name.replace(/[ /]/g, "-");

      if (image_url.includes("vercel")) {
        const image = await fetch(image_url);
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Optimiza el GIF
        const optimizedBuffer = await optimizeGif(buffer);

        // UPLOAD
        const s3Client = new S3Client({
          region: 'us-east-1',
          credentials: {
              accessKeyId: 'ACCES KEY',
              secretAccessKey: 'SECRET KEY',
          },
        });
        const fileName = `${directory}/${name}${Date.now()}`;
        const uploadParams = {
            Bucket: 'hplan',
            Key: fileName,
            Body: optimizedBuffer,
            ContentType: "image/gif",
            ACL: ObjectCannedACL.public_read,
        };

        const result = await s3Client.send(new PutObjectCommand(uploadParams));
        const newUrl = `https://hplan.s3.us-east-1.amazonaws.com/${fileName}`;
        // UPLOAD

        try {
          await sql`
            UPDATE exercises 
            SET image_url = ${newUrl} 
            WHERE id = ${id}
          `;
          console.log(`Imagen actualizada para ejercicio ID ${name}`);

        } catch (error) {
          console.error(`Error al subir imagen para ejercicio ID ${name}:`, error);
        }
      }
    }

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch exercises');
  }
}

migrateImages()
  .then(() => console.log('Migración completada'))
  .catch(error => console.error('Error en la migración:', error));