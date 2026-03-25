import { useMemo, useState } from "react";
import { REVIEW_DATA, type Review, type ReviewType } from "@/utils/reviews";

type FilterValue = "All" | "Platform" | "Providers";

interface FormState {
  name: string;
  rating: number;
  comment: string;
  type: "Platform" | "Provider";
}

const renderStars = (rating: number) => {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rounded;
    return (
      <span key={`${rating}-${index}`} className={isFilled ? "text-amber-500" : "text-muted-foreground/40"}>
        {isFilled ? "★" : "☆"}
      </span>
    );
  });
};

const CustomerReviewsSection = () => {
  const [filter, setFilter] = useState<FilterValue>("All");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [formState, setFormState] = useState<FormState>({
    name: "",
    rating: 5,
    comment: "",
    type: "Platform",
  });
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const allReviews = useMemo(() => [...userReviews, ...REVIEW_DATA], [userReviews]);

  const filteredReviews = useMemo(() => {
    if (filter === "All") {
      return allReviews;
    }

    if (filter === "Providers") {
      return allReviews.filter((review) => review.type === "Provider");
    }

    return allReviews.filter((review) => review.type === "Platform");
  }, [allReviews, filter]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = formState.name.trim();
    const trimmedComment = formState.comment.trim();

    if (!trimmedName || !trimmedComment) {
      setSubmittedMessage("Please add your name and feedback comment.");
      return;
    }

    setUserReviews((prev) => [
      {
        name: trimmedName,
        rating: formState.rating,
        comment: trimmedComment,
        type: formState.type as ReviewType,
      },
      ...prev,
    ]);

    setFormState({
      name: "",
      rating: 5,
      comment: "",
      type: "Platform",
    });
    setSubmittedMessage("Feedback submitted (Demo mode)");
  };

  return (
    <section className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Customer Reviews & Feedback</h2>
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Platform", "Providers"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredReviews.map((review, index) => (
          <article
            key={`${review.name}-${index}`}
            className="rounded-lg border border-border bg-secondary/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{review.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  review.type === "Platform"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {review.type}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5" aria-label={`Rating ${review.rating} out of 5`}>
                {renderStars(review.rating)}
              </div>
              <span className="text-xs text-muted-foreground">{review.rating.toFixed(1)}</span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
          </article>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 rounded-lg border border-border bg-background/70 p-4">
        <h3 className="text-sm font-semibold text-foreground">Share Your Feedback</h3>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted-foreground">
            Name
            <input
              type="text"
              value={formState.name}
              onChange={(event) => updateForm("name", event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-all focus:ring-2 focus:ring-ring"
              placeholder="Your name"
            />
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Type
            <select
              value={formState.type}
              onChange={(event) => updateForm("type", event.target.value as FormState["type"])}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-all focus:ring-2 focus:ring-ring"
            >
              <option value="Platform">Platform</option>
              <option value="Provider">Service Provider</option>
            </select>
          </label>

          <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
            Rating ({formState.rating})
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={formState.rating}
              onChange={(event) => updateForm("rating", Number(event.target.value))}
              className="mt-2 w-full"
            />
            <div className="mt-1 flex items-center gap-0.5 text-sm">{renderStars(formState.rating)}</div>
          </label>

          <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
            Comment
            <textarea
              value={formState.comment}
              onChange={(event) => updateForm("comment", event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-all focus:ring-2 focus:ring-ring"
              placeholder="Write your feedback"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Submit Feedback
          </button>
          {submittedMessage && <p className="text-xs text-muted-foreground">{submittedMessage}</p>}
        </div>
      </form>
    </section>
  );
};

export default CustomerReviewsSection;