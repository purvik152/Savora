import { SubmitRecipeForm } from '@/components/community/SubmitRecipeForm';
import { Upload } from 'lucide-react';

export default function SubmitRecipePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Share Your Recipe</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Become a part of the Savora community by sharing your own culinary creations. Fill out the form below to get started.
        </p>
      </div>
      <SubmitRecipeForm />
    </div>
  );
}
