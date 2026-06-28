import { createClient } from "@/lib/supabase/client";

export async function createOrganization(
  name: string,
  userId: string
) {
  const supabase = createClient();

  const slug =
    name
        .toLowerCase()
        .replace(/\s+/g, "-") +
    "-" +
    Date.now();

  console.log("Creating org:", {
    name,
    slug,
    userId,
  });

  const { error } = await supabase
    .from("organizations")
    .insert({
        name,
        slug,
        created_by: userId,
    });

    console.log(
        "ORG INSERT ERROR",
        JSON.stringify(error, null, 2)
        );

    
        
    if (error) {
    return { error };
    }

    const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  console.log("Organization insert result:", {
    organization,
    error,
  });

  if (error) {
    return { error };
  }

  const { data: membership, error: memberError } =
    await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: userId,
        role: "owner",
      })
      .select();

  console.log("Membership insert result:", {
    membership,
    memberError,
  });

  if (memberError) {
    return { error: memberError };
  }

  return {
    organization,
    error: null,
  };
}