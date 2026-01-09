"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek, isSameDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User, Video, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  interviewer_id: string;
  interviewer_name: string | null;
  is_preferred: boolean;
}

interface AvailabilityPickerProps {
  interviewerIds: string[];
  onSlotSelect: (slot: AvailabilitySlot) => void;
  onSchedule: (slot: AvailabilitySlot, type: string) => Promise<void>;
  durationOptions?: number[];
  defaultDuration?: number;
  maxDaysAhead?: number;
  timezone?: string;
  showInterviewType?: boolean;
}

const INTERVIEW_TYPES = [
  { value: "phone_screen", label: "Triagem por Telefone", icon: <Clock className="h-4 w-4" /> },
  { value: "video_call", label: "Videochamada", icon: <Video className="h-4 w-4" /> },
  { value: "technical", label: "Entrevista Tecnica", icon: <Video className="h-4 w-4" /> },
  { value: "behavioral", label: "Entrevista Comportamental", icon: <User className="h-4 w-4" /> },
  { value: "in_person", label: "Presencial", icon: <MapPin className="h-4 w-4" /> },
];

export function AvailabilityPicker({
  interviewerIds,
  onSlotSelect,
  onSchedule,
  durationOptions = [30, 45, 60, 90, 120],
  defaultDuration = 60,
  maxDaysAhead = 30,
  timezone = "America/Sao_Paulo",
  showInterviewType = true,
}: AvailabilityPickerProps) {
  const { toast } = useToast();

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [duration, setDuration] = useState<number>(defaultDuration);
  const [interviewType, setInterviewType] = useState<string>("video_call");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch availability for selected date range
  const fetchAvailability = useCallback(async () => {
    if (interviewerIds.length === 0) return;

    setIsLoading(true);
    setAvailableSlots([]);

    const startDate = weekStart;
    const endDate = addDays(weekStart, 7);

    try {
      const params = new URLSearchParams({
        duration_minutes: duration.toString(),
        timezone,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      interviewerIds.forEach((id) => params.append("interviewer_ids", id));

      const response = await fetch(`/api/v1/scheduling/availability?${params}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      setAvailableSlots(data.slots || []);

      toast({
        title: "Disponibilidade carregada",
        description: `${data.total_slots} horarios disponiveis encontrados`,
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast({
        title: "Erro ao carregar disponibilidade",
        description: "Nao foi possivel buscar os horarios disponiveis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [interviewerIds, weekStart, duration, timezone, toast]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Get slots for selected date
  const slotsForSelectedDate = availableSlots.filter((slot) => {
    const slotDate = new Date(slot.start_time);
    return isSameDay(slotDate, selectedDate);
  });

  // Group slots by time
  const groupedSlots = slotsForSelectedDate.reduce(
    (acc, slot) => {
      const time = format(new Date(slot.start_time), "HH:mm");
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(slot);
      return acc;
    },
    {} as Record<string, AvailabilitySlot[]>
  );

  // Handle slot selection
  const handleSlotClick = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    onSlotSelect(slot);
  };

  // Handle scheduling
  const handleSchedule = async () => {
    if (!selectedSlot) return;

    setIsScheduling(true);
    try {
      await onSchedule(selectedSlot, interviewType);
      toast({
        title: "Entrevista agendada",
        description: `Entrevista marcada para ${format(new Date(selectedSlot.start_time), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}`,
      });
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        title: "Erro ao agendar",
        description: "Nao foi possivel agendar a entrevista",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    if (!isBefore(newWeekStart, new Date())) {
      setWeekStart(newWeekStart);
    }
  };

  const goToNextWeek = () => {
    const maxDate = addDays(new Date(), maxDaysAhead);
    const newWeekStart = addDays(weekStart, 7);
    if (isBefore(newWeekStart, maxDate)) {
      setWeekStart(newWeekStart);
    }
  };

  // Check if date has available slots
  const dateHasSlots = (date: Date) => {
    return availableSlots.some((slot) => isSameDay(new Date(slot.start_time), date));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agendar Entrevista
          </CardTitle>
          <CardDescription>
            Selecione a data, horario e tipo de entrevista
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Duration and Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duracao</label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duracao" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((mins) => (
                    <SelectItem key={mins} value={mins.toString()}>
                      {mins} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showInterviewType && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Entrevista</label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} -{" "}
              {format(addDays(weekStart, 6), "dd 'de' MMMM", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week View */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = addDays(weekStart, index);
              const hasSlots = dateHasSlots(date);
              const isSelected = isSameDay(date, selectedDate);
              const isPast = isBefore(date, new Date()) && !isSameDay(date, new Date());

              return (
                <button
                  key={index}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                  className={cn(
                    "p-3 rounded-lg text-center transition-colors",
                    "hover:bg-muted/50",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    hasSlots && !isSelected && "bg-green-50 dark:bg-green-900/20",
                    isPast && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="text-xs font-medium">
                    {format(date, "EEE", { locale: ptBR })}
                  </div>
                  <div className="text-lg font-semibold">{format(date, "d")}</div>
                  {hasSlots && (
                    <div className="mt-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mx-auto",
                          isSelected ? "bg-primary-foreground" : "bg-green-500"
                        )}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Available Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Horarios Disponiveis - {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </h4>
              <Badge variant="outline">
                {slotsForSelectedDate.length} horario(s)
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : slotsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum horario disponivel nesta data
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {Object.entries(groupedSlots)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([time, slots]) => {
                    const slot = slots[0]; // Use first slot for this time
                    const isSelected = selectedSlot &&
                      selectedSlot.start_time === slot.start_time &&
                      selectedSlot.interviewer_id === slot.interviewer_id;

                    return (
                      <button
                        key={`${time}-${slot.interviewer_id}`}
                        onClick={() => handleSlotClick(slot)}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all",
                          "hover:border-primary hover:shadow-sm",
                          isSelected && "border-primary bg-primary/10 shadow-sm",
                          slot.is_preferred && "ring-1 ring-green-500/50"
                        )}
                      >
                        <div className="text-sm font-semibold">{time}</div>
                        {slot.interviewer_name && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {slot.interviewer_name}
                          </div>
                        )}
                        {slot.is_preferred && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Preferido
                          </Badge>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedSlot ? (
              <span>
                Selecionado:{" "}
                <strong>
                  {format(new Date(selectedSlot.start_time), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                </strong>
              </span>
            ) : (
              "Selecione um horario"
            )}
          </div>
          <Button
            onClick={handleSchedule}
            disabled={!selectedSlot || isScheduling}
          >
            {isScheduling ? "Agendando..." : "Agendar Entrevista"}
          </Button>
        </CardFooter>
      </Card>

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Data:</dt>
                <dd className="text-sm font-medium">
                  {format(new Date(selectedSlot.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Horario:</dt>
                <dd className="text-sm font-medium">
                  {format(new Date(selectedSlot.start_time), "HH:mm")} -{" "}
                  {format(new Date(selectedSlot.end_time), "HH:mm")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Duracao:</dt>
                <dd className="text-sm font-medium">{selectedSlot.duration_minutes} minutos</dd>
              </div>
              {selectedSlot.interviewer_name && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Entrevistador:</dt>
                  <dd className="text-sm font-medium">{selectedSlot.interviewer_name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Tipo:</dt>
                <dd className="text-sm font-medium">
                  {INTERVIEW_TYPES.find((t) => t.value === interviewType)?.label}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Fuso Horario:</dt>
                <dd className="text-sm font-medium">{timezone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AvailabilityPicker;
