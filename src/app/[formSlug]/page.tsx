import { getDirectFormConfig } from "@/app/api/create-account/directForms";
import DirectAccountPage from "@/components/DirectAccountPage";
import { notFound } from "next/navigation";

interface DirectFormPageProps {
  params: Promise<{
    formSlug: string;
  }>;
}

export default async function DirectFormPage({ params }: DirectFormPageProps) {
  const { formSlug } = await params;
  const formConfig = getDirectFormConfig(formSlug);

  if (!formConfig) {
    notFound();
  }

  return <DirectAccountPage formConfig={formConfig} />;
}
