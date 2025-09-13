import { NotebookIcon } from "lucide-react";
import { Link, useParams } from "react-router";

const MealsNotFound = () => {
    const { date: routeDate } = useParams();
    const date = routeDate || new Date().toISOString().split("T")[0];
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      <div className="bg-primary/10 rounded-full p-8">
        <NotebookIcon className="size-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No entries yet</h3>
      <p className="text-base-content/70">
        Create a meal to start tracking!
      </p>
      <Link to={`/${date}/create`} className="btn btn-primary">
        Create a meal
      </Link>
    </div>
  );
};
export default MealsNotFound;