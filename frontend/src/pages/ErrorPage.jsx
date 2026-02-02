
const ErrorPage = () => {
  return (
   <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-500">Oops!</h1>
      <p className="mt-4">404, page not found</p>
      {/* <p className="mt-2 text-slate-500">
        <i>{error.statusText || error.message}</i>
      </p> */}
    </div>
  )
}

export default ErrorPage
