import MainLayout from "./Layout"

function App() {

  return (
    <>
      <MainLayout>
        {/* محتوای هر صفحه */}
        <h1 className="text-2xl text-indigo-500 dark:text-indigo-300">
          صفحه اصلی
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          محتوای تستی
        </p>
      </MainLayout>
    </>
  )
}

export default App
