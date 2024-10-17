'use client';

import { Plan, Session } from '@/app/lib/definitions';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';

export default function ShowPlan({ plan }: { plan: Plan }){
  
  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="flex flex-col">
          <div className="text-lg font-medium">{plan.name}</div>
          <div className="text-sm">{plan.description || "(Sin descripción)"}</div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-row items-center">
          <label htmlFor="exercise" className="grow mb-2 block">
            Sesiones
          </label>
        </div>
        <div className="mt-4">
          { plan.sessions
              .sort((a: Session, b: Session) => a.position - b.position)
              .map((session, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
              <Link href={`/plans/${plan.id}/sessions/${session.id}`}>
                <div className="flex flex-row items-center">
                  <div className="flex flex-col">
                    <div className="text-lg font-medium">{session.name}</div>
                    <div className="text-sm">{session.description}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      { plan.sessions.length == 0 &&
        <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
          <p className="text-sm text-gray-500 text-center">No hay sesiones</p>
        </div>
      }
    </div>
  );
}