"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LoadingOverlay from "@/components/LoadingOverlay";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  pdfFile: z.any().refine((file) => file instanceof File, "PDF file is required"),
  coverImage: z.any().optional(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author name is required"),
  voice: z.string().min(1, "Please choose a voice"),
});

type FormValues = z.infer<typeof formSchema>;

const voices = {
  male: [
    { id: "dave", name: "Dave", description: "Young male, British-Essex, casual & conversational" },
    { id: "daniel", name: "Daniel", description: "Middle-aged male, British, authoritative but warm" },
    { id: "chris", name: "Chris", description: "Male, casual & easy-going" },
  ],
  female: [
    { id: "rachel", name: "Rachel", description: "Young female, American, calm & clear" },
    { id: "sarah", name: "Sarah", description: "Young female, American, soft & approachable" },
  ],
};

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    // Simulate synthesis process
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(values);
    setIsSubmitting(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "pdfFile" | "coverImage"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(field, file);
      form.clearErrors(field);
    }
  };

  const removeFile = (field: "pdfFile" | "coverImage") => {
    form.setValue(field, undefined);
    if (field === "pdfFile") {
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    } else {
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const pdfFile = form.watch("pdfFile");
  const coverImage = form.watch("coverImage");

  return (
    <div className="new-book-wrapper !mt-0 !mb-0">
      {isSubmitting && <LoadingOverlay />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* PDF Upload */}
          <FormField
            control={form.control}
            name="pdfFile"
            render={() => (
              <FormItem className="text-center">
                <FormLabel className="form-label">Book PDF File</FormLabel>
                <FormControl>
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className={cn(
                      "upload-dropzone border-2 border-dashed border-[#8B7355]/30",
                      pdfFile && "upload-dropzone-uploaded"
                    )}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden pointer-events-none"
                      ref={pdfInputRef}
                      onChange={(e) => handleFileChange(e, "pdfFile")}
                    />
                    {pdfFile ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                          <p className="upload-dropzone-text line-clamp-1 max-w-[300px]">
                            {pdfFile.name}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile("pdfFile");
                            }}
                            className="upload-dropzone-remove"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">Click to upload PDF</p>
                        <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cover Image Upload */}
          <FormField
            control={form.control}
            name="coverImage"
            render={() => (
              <FormItem className="text-center">
                <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                <FormControl>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className={cn(
                      "upload-dropzone border-2 border-dashed border-[#8B7355]/30",
                      coverImage && "upload-dropzone-uploaded"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden pointer-events-none"
                      ref={coverInputRef}
                      onChange={(e) => handleFileChange(e, "coverImage")}
                    />
                    {coverImage ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                          <p className="upload-dropzone-text line-clamp-1 max-w-[300px]">
                            {coverImage.name}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile("coverImage");
                            }}
                            className="upload-dropzone-remove"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <p className="upload-dropzone-hint">
                          Leave empty to auto-generate from PDF
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">Click to upload cover image</p>
                        <p className="upload-dropzone-hint">
                          Leave empty to auto-generate from PDF
                        </p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title Input */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="text-center">
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Rich Dad Poor Dad"
                    className="form-input h-auto"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author Input */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem className="text-center">
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Robert Kiyosaki"
                    className="form-input h-auto"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Voice Selector */}
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem className="space-y-4 text-center">
                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-6"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center">
                        Male Voices
                      </p>
                      <div className="voice-selector-options">
                        {voices.male.map((voice) => (
                          <label
                            key={voice.id}
                            className={cn(
                              "voice-selector-option",
                              field.value === voice.id
                                ? "voice-selector-option-selected"
                                : "voice-selector-option-default"
                            )}
                          >
                            <RadioGroupItem value={voice.id} className="sr-only" />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center",
                                    field.value === voice.id
                                      ? "border-[var(--accent-warm)]"
                                      : "border-gray-300"
                                  )}
                                >
                                  {field.value === voice.id && (
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-warm)]" />
                                  )}
                                </div>
                                <span className="font-bold text-black">{voice.name}</span>
                              </div>
                              <span className="text-xs text-[var(--text-secondary)] mt-1">
                                {voice.description}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center">
                        Female Voices
                      </p>
                      <div className="voice-selector-options">
                        {voices.female.map((voice) => (
                          <label
                            key={voice.id}
                            className={cn(
                              "voice-selector-option",
                              field.value === voice.id
                                ? "voice-selector-option-selected"
                                : "voice-selector-option-default"
                            )}
                          >
                            <RadioGroupItem value={voice.id} className="sr-only" />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center",
                                    field.value === voice.id
                                      ? "border-[var(--accent-warm)]"
                                      : "border-gray-300"
                                  )}
                                >
                                  {field.value === voice.id && (
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-warm)]" />
                                  )}
                                </div>
                                <span className="font-bold text-black">{voice.name}</span>
                              </div>
                              <span className="text-xs text-[var(--text-secondary)] mt-1">
                                {voice.description}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="form-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synthesizing...
              </>
            ) : (
              "Begin Synthesis"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UploadForm;
