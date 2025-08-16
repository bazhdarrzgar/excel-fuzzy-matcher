import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div className="px-4 py-8 mx-auto bg-gray-50 min-h-screen">
        <div className="max-w-screen-md mx-auto flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl text-gray-600 mb-4">Page Not Found</h2>
            <p className="text-gray-500 mb-8">
              The page you're looking for doesn't exist.
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go back home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}