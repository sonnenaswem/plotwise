import { createClient } from "@/lib/supabase/client";

export type CurrentAccountProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
};

function createInitials(
  firstName: string,
  lastName: string,
  email: string
) {
  const initials = [
    firstName.trim().charAt(0),
    lastName.trim().charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (initials) {
    return initials;
  }

  return email.trim().charAt(0).toUpperCase() || "U";
}

export async function getCurrentAccountProfile(): Promise<{
  data: CurrentAccountProfile | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      data: null,
      error: new Error(userError.message),
    };
  }

  if (!user) {
    return {
      data: null,
      error: new Error("You must be signed in."),
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        email,
        first_name,
        last_name
      `
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  const email =
    data?.email?.trim() ||
    user.email?.trim() ||
    "";

  const firstName =
    data?.first_name?.trim() || "";

  const lastName =
    data?.last_name?.trim() || "";

  const fullName =
    [firstName, lastName]
      .filter(Boolean)
      .join(" ") ||
    email ||
    "Your account";

  return {
    data: {
      id: user.id,
      email,
      firstName,
      lastName,
      fullName,
      initials: createInitials(
        firstName,
        lastName,
        email
      ),
    },
    error: null,
  };
}

export async function updateCurrentAccountProfile(input: {
  firstName: string;
  lastName: string;
}): Promise<{
  data: CurrentAccountProfile | null;
  error: Error | null;
}> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) {
    return {
      data: null,
      error: new Error("First name is required."),
    };
  }

  if (!lastName) {
    return {
      data: null,
      error: new Error("Last name is required."),
    };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      data: null,
      error: new Error(userError.message),
    };
  }

  if (!user) {
    return {
      data: null,
      error: new Error("You must be signed in."),
    };
  }

  const email = user.email?.trim() || "";

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email,
        first_name: firstName,
        last_name: lastName,
      },
      {
        onConflict: "id",
      }
    )
    .select(
      `
        id,
        email,
        first_name,
        last_name
      `
    )
    .single();

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  return {
    data: {
      id: data.id,
      email: data.email,
      firstName:
        data.first_name?.trim() || "",
      lastName:
        data.last_name?.trim() || "",
      fullName: [
        data.first_name,
        data.last_name,
      ]
        .filter(Boolean)
        .join(" "),
      initials: createInitials(
        data.first_name || "",
        data.last_name || "",
        data.email
      ),
    },
    error: null,
  };
}