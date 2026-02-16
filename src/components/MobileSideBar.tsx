import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from 'lucide-react';
import { SideBar } from './SideBar';

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Sidebar className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SideBar />
      </SheetContent>
    </Sheet>
  );
}
