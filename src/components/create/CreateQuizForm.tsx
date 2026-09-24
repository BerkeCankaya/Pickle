"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { FormAlert } from "@/components/auth/FormAlert";
import { ImageIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import {
  ACCEPT_ATTR,
  MAX_OPTIONS,
  MIN_OPTIONS,
  OPTION_NAME_MAX,
  UploadError,
  checkFile,
  createErrorMessage,
  nameFromFile,
  removeMedia,
  runWithLimit,
  uploadMedia,
} from "@/lib/create/files";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/types/quiz";

const TITLE_MAX = 50;
const DESCRIPTION_MAX = 300;
const UPLOAD_CONCURRENCY = 4;

type DraftOption = {
  key: string;
  file: File;
  previewUrl: string;
  name: string;
};

type Cover = { file: File; previewUrl: string };

type Progress = { done: number; total: number };

type FieldErrors = Partial<Record<"title" | "category" | "options" | "names", string>>;

export function CreateQuizForm({ userId }: { userId: string }) {
  const router = useRouter();
  const categoryId = useId();
  const optionsInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cover, setCover] = useState<Cover | null>(null);
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [dragging, setDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  const publishing = progress !== null;
  const hasDraft = Boolean(title || description || cover || options.length);

  // Önizleme adreslerini (blob:) sayfa kapanınca serbest bırak.
  const latest = useRef({ options, cover });
  useEffect(() => {
    latest.current = { options, cover };
  }, [options, cover]);
  useEffect(
    () => () => {
      latest.current.options.forEach((option) => URL.revokeObjectURL(option.previewUrl));
      if (latest.current.cover) URL.revokeObjectURL(latest.current.cover.previewUrl);
    },
    [],
  );

  // Form doluyken sayfadan çıkılırsa tarayıcı uyarı versin.
  useEffect(() => {
    if (!hasDraft) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft]);

  function addFiles(files: FileList | File[]) {
    const errors: string[] = [];
    const added: DraftOption[] = [];
    const room = MAX_OPTIONS - options.length;

    for (const file of Array.from(files)) {
      const problem = checkFile(file);
      if (problem) {
        errors.push(problem);
        continue;
      }
      if (added.length >= room) {
        errors.push(`En fazla ${MAX_OPTIONS} seçenek ekleyebilirsin; fazla dosyalar eklenmedi.`);
        break;
      }
      added.push({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        name: nameFromFile(file.name),
      });
    }

    setOptions((current) => [...current, ...added]);
    setFileErrors(errors);
    if (added.length) setFieldErrors((current) => ({ ...current, options: undefined }));
  }

  function removeOption(key: string) {
    setOptions((current) => {
      const target = current.find((option) => option.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((option) => option.key !== key);
    });
  }

  function renameOption(key: string, name: string) {
    setOptions((current) => current.map((option) => (option.key === key ? { ...option, name } : option)));
  }

  function pickCover(file: File | undefined) {
    if (!file) return;
    const problem = checkFile(file);
    if (problem) {
      setFileErrors([problem]);
      return;
    }
    if (cover) URL.revokeObjectURL(cover.previewUrl);
    setCover({ file, previewUrl: URL.createObjectURL(file) });
  }

  function clearCover() {
    if (cover) URL.revokeObjectURL(cover.previewUrl);
    setCover(null);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!publishing) addFiles(event.dataTransfer.files);
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = "Başlık gerekli.";
    if (!category) errors.category = "Bir kategori seç.";
    if (options.length < MIN_OPTIONS) {
      errors.options = `En az ${MIN_OPTIONS} seçenek eklemelisin (şu an ${options.length}).`;
    }
    if (options.some((option) => !option.name.trim())) errors.names = "Her seçeneğe bir ad ver.";
    return errors;
  }

  async function publish() {
    const errors = validate();
    setFieldErrors(errors);
    setFormError(null);
    if (Object.values(errors).some(Boolean)) {
      setFormError("Yayınlamadan önce işaretli alanları düzelt.");
      return;
    }

    const files = [...(cover ? [cover.file] : []), ...options.map((option) => option.file)];
    const uploaded: string[] = [];
    setProgress({ done: 0, total: files.length });

    try {
      const paths = await runWithLimit(
        files.map((file) => async () => {
          const path = await uploadMedia(userId, file);
          uploaded.push(path);
          setProgress((current) => current && { ...current, done: current.done + 1 });
          return path;
        }),
        UPLOAD_CONCURRENCY,
      );

      const coverPath = cover ? paths[0] : null;
      const optionPaths = cover ? paths.slice(1) : paths;

      const { data: quizId, error } = await createClient().rpc("create_quiz", {
        p_title: title.trim(),
        p_description: description.trim(),
        p_category: category,
        p_cover_path: coverPath,
        p_options: options.map((option, index) => ({ name: option.name.trim(), path: optionPaths[index] })),
      });
      if (error || !quizId) throw new UploadError(createErrorMessage(error?.message));

      setOptions([]);
      setCover(null);
      setTitle("");
      setDescription("");
      router.push(`/quiz/${quizId}`);
    } catch (caught) {
      await removeMedia(uploaded).catch(() => {});
      setFormError(caught instanceof UploadError ? caught.message : "Quiz yayınlanamadı. Lütfen tekrar dene.");
      setProgress(null);
    }
  }

  const countTone =
    options.length >= MIN_OPTIONS ? "text-success" : options.length > 0 ? "text-warning" : "text-secondary";

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!publishing) publish();
      }}
      className="flex flex-col gap-10"
    >
      <fieldset disabled={publishing} className="flex flex-col gap-6">
        <legend className="mb-6 font-display text-xl font-semibold">Quiz bilgileri</legend>
        <Input
          label="Başlık"
          required
          maxLength={TITLE_MAX}
          showCount
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
          placeholder="Ör. En iyi sokak lezzeti hangisi?"
        />
        <Textarea
          label="Açıklama"
          maxLength={DESCRIPTION_MAX}
          showCount
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          hint="İsteğe bağlı."
        />
        <div className="flex flex-col gap-2">
          <label htmlFor={categoryId} className="text-sm font-medium">
            Kategori
            <span className="text-secondary" aria-hidden="true">
              {" "}
              *
            </span>
          </label>
          <select
            id={categoryId}
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-invalid={fieldErrors.category ? true : undefined}
            className={cn(
              "h-12 w-full cursor-pointer rounded-field bg-surface px-4 text-base text-primary ring-1 ring-secondary/30 outline-none",
              "transition-[box-shadow] duration-200 ease-out-soft hover:ring-secondary/60 focus:ring-2 focus:ring-accent focus:shadow-glow-sm",
              !category && "text-secondary",
              fieldErrors.category && "ring-danger hover:ring-danger",
            )}
          >
            <option value="" disabled>
              Kategori seç
            </option>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {fieldErrors.category && <p className="text-sm text-danger">{fieldErrors.category}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Kapak görseli</p>
          <div className="flex items-center gap-4">
            <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-field bg-surface ring-1 ring-secondary/30">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- yerel önizleme (blob:)
                <img src={cover.previewUrl} alt="Kapak önizlemesi" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-secondary">
                  <ImageIcon className="size-6" />
                </span>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => coverInput.current?.click()}>
                  {cover ? "Değiştir" : "Kapak seç"}
                </Button>
                {cover && (
                  <Button variant="ghost" size="sm" onClick={clearCover}>
                    Kaldır
                  </Button>
                )}
              </div>
              <p className="text-sm text-secondary">İsteğe bağlı. Seçmezsen ilk seçenek kapak olur.</p>
            </div>
            <input
              ref={coverInput}
              type="file"
              accept={ACCEPT_ATTR}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                pickCover(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
        </div>
      </fieldset>

      <fieldset disabled={publishing} className="flex flex-col gap-4">
        <legend className="mb-4 flex w-full flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-xl font-semibold">Seçenekler</span>
          <span className={cn("text-sm tabular-nums", countTone)}>
            {options.length}/{MAX_OPTIONS} seçenek (en az {MIN_OPTIONS})
          </span>
        </legend>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center gap-3 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-accent bg-accent/10" : "border-secondary/30",
            fieldErrors.options && !dragging && "border-danger/60",
          )}
        >
          <ImageIcon className="size-8 text-accent-soft" />
          <p className="font-medium">Resimleri buraya sürükle</p>
          <p className="max-w-prose text-sm text-secondary">
            JPG, PNG, WEBP (en fazla 5 MB, otomatik küçültülür) veya GIF (en fazla 10 MB). Seçenek adları dosya
            adından gelir, sonra değiştirebilirsin.
          </p>
          <Button variant="secondary" size="sm" onClick={() => optionsInput.current?.click()}>
            <PlusIcon className="size-4" />
            Dosya seç
          </Button>
          <input
            ref={optionsInput}
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {fieldErrors.options && <p className="text-sm text-danger">{fieldErrors.options}</p>}
        {fileErrors.length > 0 && (
          <FormAlert tone="error">
            {fileErrors.map((message) => (
              <span key={message} className="block">
                {message}
              </span>
            ))}
          </FormAlert>
        )}
        {fieldErrors.names && <p className="text-sm text-danger">{fieldErrors.names}</p>}

        {options.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {options.map((option, index) => (
              <li key={option.key} className="flex flex-col overflow-hidden rounded-card bg-surface ring-1 ring-accent/20">
                <div className="relative aspect-[4/3] bg-background/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- yerel önizleme (blob:) */}
                  <img src={option.previewUrl} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeOption(option.key)}
                    aria-label={`${option.name || `${index + 1}. seçenek`} kaldır`}
                    className="absolute top-2 right-2 flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/80 text-lg leading-none backdrop-blur transition-colors hover:bg-danger hover:text-background focus-visible:outline-2 focus-visible:outline-accent-soft"
                  >
                    ×
                  </button>
                </div>
                <label className="p-2">
                  <span className="sr-only">{index + 1}. seçeneğin adı</span>
                  <input
                    value={option.name}
                    maxLength={OPTION_NAME_MAX}
                    onChange={(event) => renameOption(option.key, event.target.value)}
                    placeholder="Seçenek adı"
                    aria-invalid={!option.name.trim() && fieldErrors.names ? true : undefined}
                    className={cn(
                      "h-10 w-full rounded-field bg-background/50 px-3 text-sm text-primary ring-1 ring-secondary/20 outline-none placeholder:text-secondary",
                      "focus:ring-2 focus:ring-accent",
                      !option.name.trim() && fieldErrors.names && "ring-danger",
                    )}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="flex flex-col gap-4">
        {formError && <FormAlert tone="error">{formError}</FormAlert>}
        {progress && (
          <div className="flex flex-col gap-2" role="status" aria-live="polite">
            <p className="text-sm text-secondary">
              {progress.done < progress.total
                ? `Görseller yükleniyor: ${progress.done}/${progress.total}`
                : "Quiz yayınlanıyor…"}
            </p>
            <div
              role="progressbar"
              aria-label="Yükleme ilerlemesi"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
              className="h-2 overflow-hidden rounded-full bg-surface"
            >
              <div
                className="h-full rounded-full bg-accent shadow-glow-sm transition-[width] duration-300 ease-out-soft"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        <Button type="submit" size="lg" loading={publishing} className="self-start">
          Yayınla
        </Button>
        <p className="text-sm text-secondary">
          Yayınlanan quiz hemen herkese görünür ve sonradan düzenlenemez; sadece silebilirsin.
        </p>
      </div>
    </form>
  );
}
