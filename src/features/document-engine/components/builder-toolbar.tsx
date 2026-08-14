import { Save, Layout, FileCheck, History, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BuilderToolbarProps {
  onTestRender: () => void;
}

export function BuilderToolbar({ onTestRender }: BuilderToolbarProps) {
  return (
    <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-blue-600" />
          <h1 className="font-semibold text-gray-900">Surat Undangan Rapat (v1.2)</h1>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            Draft
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-gray-600 gap-2">
          <History className="w-4 h-4" /> Versi
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onTestRender}
          className="text-blue-600 bg-blue-50 hover:bg-blue-100 gap-2"
        >
          <Play className="w-4 h-4" /> Test Render
        </Button>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        <Button variant="ghost" size="sm" className="text-gray-600 gap-2">
          <Save className="w-4 h-4" /> Simpan
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <FileCheck className="w-4 h-4" /> Publish
        </Button>
      </div>
    </div>
  );
}
