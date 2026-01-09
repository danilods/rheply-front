"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface DeleteAccountModalProps {
  onDelete?: (reason: string) => Promise<void>;
}

export function DeleteAccountModal({ onDelete }: DeleteAccountModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30);
  const formattedDeletionDate = deletionDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isConfirmValid = confirmText === "EXCLUIR";

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);

    try {
      // In production, this would be an API call
      // await fetch('/api/user/delete', {
      //   method: 'DELETE',
      //   body: JSON.stringify({ reason }),
      // });

      if (onDelete) {
        await onDelete(reason);
      } else {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      toast({
        title: "Solicitação enviada",
        description: `Sua conta será excluída até ${formattedDeletionDate}. Você receberá um email de confirmação.`,
      });

      setIsOpen(false);

      // In production, redirect to logout or confirmation page
      // router.push('/conta-excluida');
    } catch (error) {
      toast({
        title: "Erro ao processar solicitação",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmText("");
      setReason("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Solicitar exclusão de dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Excluir Conta e Dados
          </DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Box */}
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">
                  Atenção: Ação Irreversível
                </h4>
                <ul className="text-xs text-destructive/90 space-y-1">
                  <li>
                    Todos os seus dados pessoais serão excluídos permanentemente
                  </li>
                  <li>
                    Suas candidaturas e histórico de entrevistas serão removidos
                  </li>
                  <li>
                    Você perderá acesso a todas as mensagens e notificações
                  </li>
                  <li>
                    Esta ação não pode ser desfeita após o período de processamento
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* LGPD Compliance Info */}
          <div className="rounded-lg bg-muted p-3 text-xs">
            <p>
              <strong>Conformidade LGPD:</strong> De acordo com a Lei Geral de Proteção de
              Dados, sua solicitação será processada em até{" "}
              <strong>30 dias corridos</strong>. Data prevista para exclusão:{" "}
              <strong>{formattedDeletionDate}</strong>.
            </p>
          </div>

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="delete-reason">Motivo (opcional)</Label>
            <Textarea
              id="delete-reason"
              placeholder="Conte-nos por que você está saindo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Seu feedback nos ajuda a melhorar a plataforma.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-destructive">
              Digite EXCLUIR para confirmar
            </Label>
            <Input
              id="confirm-delete"
              placeholder="EXCLUIR"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Minha Conta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
