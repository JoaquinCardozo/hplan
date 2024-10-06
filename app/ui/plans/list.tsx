import { UpdatePlan, DeletePlan } from '@/app/ui/plans/buttons';
import { fetchFilteredPlansByPage } from "@/app/lib/data";
import { WorkoutExercise } from '@/app/lib/definitions';

export default async function PlanList({ query, currentPage} : { query: string, currentPage: number }){
	const plans = await fetchFilteredPlansByPage(query, currentPage);

	return (
		<div>
			{plans?.map((plan) => (
				<div key={plan.id} className="flex flex-col border rounded-lg my-5 p-3">

					<div className="relative flex items-center mb-5">
			      <div className="grow font-bold">{plan.name}</div>
					  <div className="absolute right-0 flex space-x-2">
					    <UpdatePlan id={plan.id} />
					    <DeletePlan id={plan.id} />
					  </div>
					</div>

					<div className="">
						{
		        	plan.description && 
		        		<p className="text-sm mb-5">{plan.description}</p>
		        }
		      </div>
				</div>
			))}
		</div>
	);
}