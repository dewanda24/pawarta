import { db } from '@/db';
import { outgoingLetters, outgoingLetterVersions } from '@/db/schema/outgoing-letter';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EditorPane } from '@/features/document-engine/components/editor-pane';
import { PreviewPane } from '@/features/document-engine/components/preview-pane';
import Link from 'next/link';

export default async function SuratKeluarEditorPage({ params }: { params: { id: string } }) {
  const [letter] = await db
    .select()
    .from(outgoingLetters)
    .where(eq(outgoingLetters.id, params.id));

  if (!letter) return notFound();

  // Get the latest draft version
  const [version] = await db
    .select()
    .from(outgoingLetterVersions)
    .where(eq(outgoingLetterVersions.suratId, letter.id))
    .orderBy(desc(outgoingLetterVersions.createdAt))
    .limit(1);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Editor Toolbar */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div>
          <h1 className="font-semibold text-sm">Editor Draft Surat: {letter.perihal}</h1>
          <p className="text-xs text-muted-foreground">Tujuan: {letter.tujuanSurat} • Status: {letter.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/surat-keluar/${letter.id}`}>
            <Button variant="outline" size="sm">Tutup Editor</Button>
          </Link>
          <Button size="sm">Simpan Konten</Button>
          {letter.status === 'DRAFT' && (
             <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">Submit Review</Button>
          )}
        </div>
      </div>
      
      {/* Workspace Area - Reusing Sprint 4 components */}
      <div className="flex-1 flex overflow-hidden">
        <EditorPane 
          content={version?.kontenHtml || ''} 
          onChange={() => {}} 
          previewMode={false}
        />
        <PreviewPane 
          previewMode={false}
          onClosePreview={() => {}}
          validationResult={{ html: version?.kontenHtml || '', missing: [] }} 
        />
      </div>
    </div>
  );
}
