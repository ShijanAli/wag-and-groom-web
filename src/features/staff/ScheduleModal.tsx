"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Copy } from "lucide-react";
import { z } from "zod";
import { FormModal } from "@/components/common/form/FormModal";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fullName } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { StaffMember } from "@/types/models";
import { WEEKDAYS, WEEK_ORDER, useSetSchedules } from "./api";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const daySchema = z
  .object({ dayOfWeek: z.number(), enabled: z.boolean(), startTime: z.string(), endTime: z.string() })
  .superRefine((d, ctx) => {
    if (!d.enabled) return;
    if (!TIME.test(d.startTime)) ctx.addIssue({ code: "custom", path: ["startTime"], message: "Start time required" });
    if (!TIME.test(d.endTime)) ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time required" });
    else if (d.startTime >= d.endTime) ctx.addIssue({ code: "custom", path: ["endTime"], message: "Must be after start" });
  });

const schema = z.object({ days: z.array(daySchema).length(7) });
type Form = z.output<typeof schema>;

const toForm = (staff: StaffMember | null): Form => ({
  days: WEEK_ORDER.map((d) => {
    const s = staff?.schedules.find((x) => x.dayOfWeek === d);
    return { dayOfWeek: d, enabled: !!s?.isActive, startTime: s?.startTime ?? "09:00", endTime: s?.endTime ?? "18:00" };
  }),
});

/** Weekly working hours editor (PUT /staff/:id/schedules replaces the whole week). */
export function ScheduleModal({ staff, open, onOpenChange }: { staff: StaffMember | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const save = useSetSchedules();
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Working hours"
      description={staff ? `${fullName(staff)} — customers can only book inside these hours.` : undefined}
      schema={schema}
      defaultValues={toForm(staff)}
      submitText="Save hours"
      onSubmit={(v) =>
        save.mutateAsync({
          id: staff!.id,
          schedules: v.days.filter((d) => d.enabled).map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime, isActive: true })),
        })
      }
    >
      <WeekRows />
    </FormModal>
  );
}

function WeekRows() {
  const { control, getValues, setValue } = useFormContext<Form>();
  const days = useWatch({ control, name: "days" });

  // copy the first working day's hours to every working day
  const copyFirst = () => {
    const first = getValues("days").find((d) => d.enabled);
    if (!first) return;
    getValues("days").forEach((d, i) => {
      if (!d.enabled) return;
      setValue(`days.${i}.startTime`, first.startTime, { shouldValidate: true });
      setValue(`days.${i}.endTime`, first.endTime, { shouldValidate: true });
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={copyFirst}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy first day to all
        </Button>
      </div>
      {days.map((d, i) => (
        <div key={d.dayOfWeek} className={cn("grid grid-cols-[110px_1fr] items-start gap-3 rounded-lg border p-3 sm:grid-cols-[130px_1fr]", !d.enabled && "bg-muted/40")}>
          <FormField
            control={control}
            name={`days.${i}.enabled`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 pt-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} aria-label={`${WEEKDAYS[d.dayOfWeek]} working`} />
                </FormControl>
                <span className="text-sm font-medium">{WEEKDAYS[d.dayOfWeek].slice(0, 3)}</span>
              </FormItem>
            )}
          />
          {d.enabled ? (
            <div className="grid grid-cols-2 gap-2">
              {(["startTime", "endTime"] as const).map((key) => (
                <FormField
                  key={key}
                  control={control}
                  name={`days.${i}.${key}`}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Input type="time" step={300} {...field} aria-label={`${WEEKDAYS[d.dayOfWeek]} ${key === "startTime" ? "start" : "end"}`} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          ) : (
            <p className="pt-2 text-sm text-muted-foreground">Day off</p>
          )}
        </div>
      ))}
    </div>
  );
}
