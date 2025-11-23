export function Input({ label, ...props }: any) {
  return (
    <div className="group relative">
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
        {label}
      </label>
      <input 
        {...props}
        className="w-full bg-surface-highlight/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
      />
    </div>
  );
}