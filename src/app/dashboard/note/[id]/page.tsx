import NoteViewer from "./NoteViewer";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteViewer id={id} />;
}