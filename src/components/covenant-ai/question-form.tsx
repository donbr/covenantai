// src/components/covenant-ai/question-form.tsx
"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  question: z.string().min(10, { message: "Question must be at least 10 characters long." }).max(1000, { message: "Question must not exceed 1000 characters." }),
});

type FormData = z.infer<typeof formSchema>;

interface QuestionFormProps {
  onSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
}

export function QuestionForm({ onSubmit, isLoading }: QuestionFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    await onSubmit(data.question);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Your Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., What are the rules regarding pet ownership?"
                  className="min-h-[100px] resize-none text-base shadow-sm"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto text-base py-3 px-6" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Ask CovenantAI"
          )}
        </Button>
      </form>
    </Form>
  );
}
