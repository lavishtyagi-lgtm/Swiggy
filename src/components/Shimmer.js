const ShimmerCard = () => (
  <div className="m-4 w-[200px] rounded-md bg-gray-100 animate-pulse">
    <div className="w-full h-36 bg-gray-300 rounded-t-md" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const Shimmer = () => (
  <div className="flex flex-wrap justify-evenly mt-4">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
      <ShimmerCard key={n} />
    ))}
  </div>
);

export default Shimmer;
