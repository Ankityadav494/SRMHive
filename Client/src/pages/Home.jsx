import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <section className="relative overflow-hidden bg-white">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-y-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-100 opacity-60 mix-blend-multiply blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 flex flex-col items-center text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 shadow-sm border border-indigo-100">
            Welcome to SRMHive ✨
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
            Find the Right Teammates <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
               For Your Next Project
            </span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            SRMHive is a premier collaboration platform where you can create
            project posts, find skilled teammates, apply to exciting ideas, and
            build your network.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/browse-projects"
              className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Explore Projects
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 text-base font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to kickstart your next big idea.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-2 border border-gray-50 group">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Ideas</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Create a collaboration post and describe the specific skills and team members you need to bring your vision to life.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 transform hover:-translate-y-2 border border-blue-50 group">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Teammates</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Browse detailed project listings and apply to join teams that perfectly match your outstanding interests and skills.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-300 transform hover:-translate-y-2 border border-purple-50 group">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Profile</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Showcase your unique skills, portfolio links, and collaboration history to stand out to project owners effortlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;