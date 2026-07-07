import { redirect } from "next/navigation";

type LegacyInvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function LegacyInvitationPage({
  params,
}: LegacyInvitationPageProps) {
  const { token } = await params;

  redirect(
    `/invitations/${encodeURIComponent(token)}`
  );
}