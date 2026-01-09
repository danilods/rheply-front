"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCandidateStore } from "@/store/candidate";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompletionProps {
  className?: string;
  showDetails?: boolean;
}

export function ProfileCompletion({ className, showDetails = true }: ProfileCompletionProps) {
  const { getProfileCompletionPercentage, getMissingProfileItems } = useCandidateStore();

  const percentage = getProfileCompletionPercentage();
  const missingItems = getMissingProfileItems();
  const completedItems = 10 - missingItems.length;

  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getIncentiveMessage = () => {
    if (percentage === 100) {
      return "Parabens! Seu perfil esta completo. Voce esta pronto para ser descoberto!";
    }
    if (percentage >= 80) {
      return "Quase la! Complete os ultimos itens para maximizar suas chances.";
    }
    if (percentage >= 50) {
      return "Perfis completos recebem 3x mais visualizacoes de recrutadores!";
    }
    return "Complete seu perfil para aumentar suas chances de ser encontrado!";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Completude do Perfil</span>
          <Badge
            variant={percentage === 100 ? "default" : "secondary"}
            className={cn(
              "text-sm font-bold",
              percentage === 100 && "bg-green-500 hover:bg-green-600"
            )}
          >
            {percentage}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-700 ease-out rounded-full",
                getProgressColor()
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{getIncentiveMessage()}</p>
        </div>

        {showDetails && missingItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Itens faltando ({missingItems.length}):
            </p>
            <ul className="space-y-2">
              {missingItems.slice(0, 5).map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
              {missingItems.length > 5 && (
                <li className="text-sm text-muted-foreground pl-6">
                  e mais {missingItems.length - 5} item(s)...
                </li>
              )}
            </ul>
          </div>
        )}

        {showDetails && completedItems > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {completedItems} de 10 secoes completas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
