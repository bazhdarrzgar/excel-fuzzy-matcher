import { Head } from "$fresh/runtime.ts";
import UploadForm from "../islands/UploadForm.tsx";
import { ThemeToggle } from "../islands/ThemeProvider.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fuzzy Column Matcher - Simple Excel Column Matching</title>
        <meta name="description" content="Simple fuzzy matching for Excel columns. Upload two Excel files, select columns, and get the best matches in a new Excel file." />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-gray-950 dark:to-black transition-all duration-500 relative overflow-hidden">
        {/* CYBERPUNK Enhanced animated background particles - only in dark mode */}
        <div className="hidden dark:block fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-purple-500/30 rounded-full animate-ping"></div>
          <div className="absolute top-32 right-20 w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-32 w-1.5 h-1.5 bg-pink-400/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-40 w-1 h-1 bg-blue-400/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-purple-400/25 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-300/20 rounded-full animate-bounce"></div>
        </div>
        {/* Header */}
        <header className="liquid-glass-header sticky top-0 z-10 border-b border-white/30 dark:border-purple-500/40 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-purple-500 dark:to-cyan-400 rounded-lg flex items-center justify-center shadow-lg dark:shadow-cyan-900/50 ring-2 ring-blue-500/20 dark:ring-cyan-400/30 dark:animate-pulse">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white drop-shadow-lg dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                    Fuzzy Column Matcher
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-cyan-300 font-medium">
                    Simple Excel Column Matching
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 glass-liquid px-3 py-1.5 rounded-lg border-green-200/50 dark:border-cyan-500/50 shadow-sm dark:shadow-cyan-900/30">
                  <div className="w-2 h-2 bg-green-500 dark:bg-cyan-400 rounded-full animate-pulse shadow-lg dark:shadow-cyan-400/50"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-cyan-300">
                    Port: {Deno.env.get("PORT") || "3000"}
                  </span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* CYBERPUNK Enhanced Hero */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:via-cyan-200 dark:to-purple-200 bg-clip-text text-transparent mb-4 drop-shadow-lg dark:drop-shadow-[0_0_20px_rgba(16,217,196,0.1)]">
              Simple Excel Column Matching
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Upload two Excel files, select one column from each, and get fuzzy matches in a new Excel file.
            </p>
          </div>

          {/* Enhanced How It Works */}
          <div className="mb-12">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  icon: "📤",
                  title: "Upload Excel Files",
                  description: "Choose two Excel files you want to compare.",
                  color: "blue",
                  darkGlow: "cyan-500/20"
                },
                {
                  step: "2", 
                  icon: "🎯",
                  title: "Select Columns",
                  description: "Pick one column from each file to match.",
                  color: "purple",
                  darkGlow: "purple-500/20"
                },
                {
                  step: "3",
                  icon: "💾",
                  title: "Download Results",
                  description: "Get a new Excel with matched data.",
                  color: "green",
                  darkGlow: "cyan-500/20"
                }
              ].map((item, index) => (
                <div key={index} className={`
                  group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl 
                  border border-gray-200/60 dark:border-gray-700/60 text-center
                  shadow-lg dark:shadow-2xl dark:shadow-black/40
                  hover:shadow-xl dark:hover:shadow-2xl hover:scale-105 
                  transition-all duration-300 cursor-pointer
                  dark:hover:shadow-${item.darkGlow}
                  ${item.color === 'blue' ? 'hover:border-blue-300 dark:hover:border-cyan-500/60 dark:hover:bg-gray-800/90' :
                    item.color === 'purple' ? 'hover:border-purple-300 dark:hover:border-purple-500/60 dark:hover:bg-gray-800/90' :
                    'hover:border-green-300 dark:hover:border-cyan-500/60 dark:hover:bg-gray-800/90'}
                `}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-4
                    transition-all duration-300 group-hover:scale-110
                    ${item.color === 'blue' ? 'bg-blue-100/80 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-cyan-800/70 dark:group-hover:shadow-lg dark:group-hover:shadow-cyan-500/30' :
                      item.color === 'purple' ? 'bg-purple-100/80 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 dark:group-hover:shadow-lg dark:group-hover:shadow-purple-500/30' :
                      'bg-green-100/80 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-cyan-800/70 dark:group-hover:shadow-lg dark:group-hover:shadow-cyan-500/30'}
                  `}>
                    {item.icon}
                  </div>
                  <div className={`
                    text-sm font-semibold mb-2
                    ${item.color === 'blue' ? 'text-blue-600 dark:text-cyan-400' :
                      item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-green-600 dark:text-cyan-400'}
                  `}>
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Dark mode glow effect */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none dark:shadow-lg dark:shadow-${item.darkGlow}`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Upload Form Container */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-8 shadow-xl dark:shadow-2xl dark:shadow-black/50 ring-1 ring-gray-200/20 dark:ring-gray-700/40">
            <UploadForm />
          </div>

          {/* Enhanced Features */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "⚡",
                title: "Fast Processing",
                description: "Quick fuzzy matching with first-result priority",
                gradient: "from-yellow-400 to-orange-500",
                darkBg: "dark:bg-gradient-to-br dark:from-yellow-900/30 dark:to-orange-900/30",
                darkShadow: "dark:shadow-yellow-500/20"
              },
              {
                icon: "📊",
                title: "Excel Output", 
                description: "Get results in Excel format: column1, column2, new_column",
                gradient: "from-green-400 to-emerald-500",
                darkBg: "dark:bg-gradient-to-br dark:from-cyan-900/30 dark:to-emerald-900/30",
                darkShadow: "dark:shadow-cyan-500/20"
              }
            ].map((feature, index) => (
              <div key={index} className={`group relative bg-gradient-to-br from-gray-50/90 to-white/90 ${feature.darkBg} backdrop-blur-sm p-6 rounded-lg border border-gray-200/60 dark:border-gray-600/60 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:scale-105 ${feature.darkShadow}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center text-white text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 dark:shadow-xl`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* CYBERPUNK Enhanced Footer */}
        <footer className="bg-white/90 dark:bg-gray-950/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-purple-500/60 mt-16 shadow-sm dark:shadow-2xl dark:shadow-black/50 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Built with <span className="text-red-500 dark:text-cyan-400 animate-pulse">♥</span> using Deno Fresh + MongoDB • Running on port {Deno.env.get("PORT") || "3000"}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}