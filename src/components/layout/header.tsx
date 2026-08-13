import { Bell, Search, UserCircle } from 'lucide-react';
import { Input } from '../ui/input';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between bg-white px-6 border-b border-gray-200">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Cari..." 
            className="pl-9 bg-gray-50 border-transparent focus-visible:bg-white" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
          <UserCircle className="w-8 h-8 text-gray-400" />
          <div className="hidden md:block text-left">
            <div className="leading-tight">Administrator</div>
            <div className="text-xs text-gray-500 font-normal">Super Admin</div>
          </div>
        </button>
      </div>
    </header>
  );
}
