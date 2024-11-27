import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuthStore } from '@/lib/auth-store';
import { ChangePassword } from './ChangePassword';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SettingsMenu = ({ username }: { username: string }) => {
  const { canResetStorage } = useAuthStore();

  const handleReset = () => {
    if (!canResetStorage()) {
      alert('Você não tem permissão para resetar o sistema.');
      return;
    }
    if (confirm('Tem certeza que deseja resetar todas as tarefas? Essa ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="p-4">
          <h4 className="font-medium mb-2">Alterar Senha</h4>
          <ChangePassword />
        </div>
        {canResetStorage() && (
          <DropdownMenuItem>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="w-full"
            >
              Limpar LocalStorage
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
