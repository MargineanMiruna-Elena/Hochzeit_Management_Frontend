import React from "react";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 py-4 rounded-xl bg-white shadow-sm">
      <div className="flex items-center gap-4 text-gray-900">
        <div className="text-pink-600 size-7">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight">EverAfter Planner</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-gray-100 text-gray-600 hover:bg-gray-200"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V8.25a6 6 0 10-12 0v1.5a8.967 8.967 0 01-2.311 6.022c1.78.683 3.6 1.109 5.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBEpVlGAI3xw0ry-jtxm7RIdT0M4WkUrwrbJaEYe21262nrF3qAr9jmzShsHPgFQqohhmnv_dqCXBeqvtTazkR68dEK7gM_ZNGt8b_anJI8eHUbApqCJnbY_3cD_oxXugANFx7KesveYwYX0lhP7jFZYSw1a1szWvfp2BsgsE89qPFU1bbZKGLUybKZwAbjwu8MLGd2Yp_SDdAOYNMRigRfzRFI1JiEf7JlyEvbbyYw-K3B1IzDRgQXUyJ5LE5PTmJDQaZVtGGWhwPe")',
          }}
        />
      </div>
    </header>
  );
}
