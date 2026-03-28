export function Contact() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">👋</p>
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        Get in <span className="text-orange-500">Touch</span>
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        Questions, feedback, or just want to say hi?
      </p>

      <div className="space-y-4">
        <a
          href="mailto:lavishtyagi2003@gmail.com"
          className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📧</span>
            <div className="text-left">
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-semibold text-gray-800">lavishtyagi2003@gmail.com</p>
            </div>
          </div>
          <span className="text-gray-300 group-hover:text-orange-400 transition-colors">→</span>
        </a>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div className="text-left">
              <p className="text-xs text-gray-400">Built with</p>
              <p className="text-sm font-semibold text-gray-800">React 19 · Tailwind CSS · Express</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
