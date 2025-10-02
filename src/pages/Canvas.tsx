import { useParams, useSearchParams } from "react-router-dom";
import { Canvas as CanvasComponent } from "@/components/Canvas/Canvas";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Canvas = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <CanvasComponent boardId={id} templateId={templateId} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Canvas;