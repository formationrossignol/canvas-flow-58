import { useParams, useSearchParams } from "react-router-dom";
import { Canvas as CanvasComponent } from "@/components/Canvas/Canvas";

const Canvas = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  // Here you could load the specific board data based on the ID
  // and apply the template if templateId is provided

  return <CanvasComponent boardId={id} templateId={templateId} />;
};

export default Canvas;