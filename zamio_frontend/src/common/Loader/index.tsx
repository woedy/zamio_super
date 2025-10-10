const Loader = () => {
  return (
    <div 
      className="flex h-screen items-center justify-center bg-white dark:bg-boxdark"
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      <div 
        className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
        aria-hidden="true"
      ></div>
      <span className="sr-only">Loading application, please wait...</span>
    </div>
  );
};

export default Loader;
