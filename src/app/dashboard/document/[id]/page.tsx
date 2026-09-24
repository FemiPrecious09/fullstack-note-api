import DocumentViewer from "./DocumentViewer";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentViewer id={id} />;
}