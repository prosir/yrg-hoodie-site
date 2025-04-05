"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerProps {
  id?: string
  onTimeChange: (time: string) => void
  defaultValue?: string
  placeholder?: string
}

export function TimePicker({ id, onTimeChange, defaultValue = "", placeholder = "Selecteer tijd" }: TimePickerProps) {
  const [time, setTime] = React.useState<string>(defaultValue)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    onTimeChange(newTime)
  }

  const timeOptions = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ]

  const selectTime = (selectedTime: string) => {
    setTime(selectedTime)
    onTimeChange(selectedTime)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !time && "text-muted-foreground")}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-2">
          <Input type="time" value={time} onChange={handleTimeChange} className="mb-2" />
          <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
            {timeOptions.map((option) => (
              <Button
                key={option}
                variant="outline"
                size="sm"
                onClick={() => selectTime(option)}
                className={cn("justify-center", time === option && "bg-primary text-primary-foreground")}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

