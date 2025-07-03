import { NewsFeedForm } from "@/components/news/NewsFeedForm";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <Newspaper className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Personal Food News Feed</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell us what you like to cook and eat, and we'll curate the latest food and health news just for you. The more you tell us, the smarter your feed gets!
        </p>
      </div>
      <NewsFeedForm />
    </div>
  );
}
