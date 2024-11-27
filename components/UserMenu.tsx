import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../auth-system';
import { ChangePassword } from './ChangePassword';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const UserMenu = ({ username }: { username: string }) => {
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {username}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="p-4">
          <h4 className="font-medium mb-2">Alterar Senha</h4>
          <ChangePassword />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
