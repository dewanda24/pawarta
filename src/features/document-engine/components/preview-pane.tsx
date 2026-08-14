import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewPaneProps {
  previewMode: boolean;
  onClosePreview: () => void;
  validationResult: {
    html: string;
    missing: string[];
  } | null;
}

export function PreviewPane({ previewMode, onClosePreview, validationResult }: PreviewPaneProps) {
  return (
    <div className={`flex-1 bg-gray-100 overflow-y-auto ${!previewMode ? 'hidden md:flex md:w-1/2' : 'w-full'} flex-col items-center py-8 relative`}>
      
      <div className="absolute top-4 right-4 flex gap-2">
         <Button 
          variant="outline"
          size="icon"
          onClick={onClosePreview}
          className="md:hidden bg-white text-gray-500"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Kertas A4 Mockup */}
      <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl flex flex-col transform origin-top md:scale-75 lg:scale-90 xl:scale-100 transition-transform">
        {/* Area Kop Surat (Header) */}
        <div className="h-[30mm] border-b-4 border-double border-gray-900 mx-[20mm] mt-[10mm] flex items-center justify-center relative">
           <span className="text-gray-300 font-bold text-xl uppercase tracking-widest absolute inset-0 flex items-center justify-center opacity-30">
             [KOP SURAT HEADER]
           </span>
        </div>

        {/* Area Isi (Body) */}
        <div className="flex-1 px-[20mm] py-[10mm]">
          {validationResult ? (
            <>
              {validationResult.missing.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  <span className="font-bold">Error:</span> Terdapat placeholder yang tidak terdaftar: {validationResult.missing.join(', ')}
                </div>
              )}
              {/* Note: This is an internal preview so dangerouslySetInnerHTML is acceptable, but in prod we should use DOMPurify */}
              <div 
                className="text-sm text-gray-900 leading-relaxed font-serif whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: validationResult.html }}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Klik "Test Render" untuk memproses template.</p>
              </div>
            </div>
          )}
        </div>

        {/* Area Tanda Tangan (Footer) */}
        <div className="h-[40mm] mx-[20mm] mb-[20mm] border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative">
           <span className="text-gray-400 font-bold text-sm absolute inset-0 flex items-center justify-center">
             [SIGNATURE FOOTER BLOCK]
           </span>
        </div>
      </div>

    </div>
  );
}
