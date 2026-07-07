import { createClient } from "@/lib/supabase/client";

export type AccountType = "individual" | "organization";

export type SelectedBillingPlan =
  | "professional"
  | "developer"
  | "enterprise";

export type SignUpMetadata = {
  firstName?: string;
  lastName?: string;
  accountType?: AccountType;
  organizationName?: string;
  organizationSlug?: string;
  selectedPlan?: SelectedBillingPlan;
  emailRedirectTo?: string;
};

export type ProfileInput = {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export type OrganizationInput = {
  name: string;
  slug: string;
  createdBy: string;
};

export type OrganizationMembershipInput = {
  organizationId: string;
  userId: string;
  role?: "owner" | "admin" | "member";
};

export type UserWorkspaceStatus = {
  hasOrganization: boolean;
  organizationId: string | null;
  organizationRole: string | null;
};

export type VerifiedSignupResult = {
  subscription_id?: string;
  organization_id?: string;
  plan_id:
    | "professional"
    | "developer"
    | "enterprise";
  status?: string;
  trial_start?: string;
  trial_end?: string;
  already_existed: boolean;
};

export type OrganizationSetupResult = {
  organization_id: string;
  role: string;
  slug?: string;
  already_existed: boolean;
};

export function createOrganizationSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "organization";
}

export async function signUp(
  email: string,
  password: string,
  metadata?: SignUpMetadata
) {
  const supabase = createClient();

  return supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo:
        metadata?.emailRedirectTo,
      data: {
        first_name:
          metadata?.firstName?.trim() || null,

        last_name:
          metadata?.lastName?.trim() || null,

        account_type:
          metadata?.accountType ?? "individual",

        organization_name:
          metadata?.organizationName?.trim() ||
          null,

        organization_slug:
          metadata?.organizationSlug
            ?.trim()
            .toLowerCase() || null,

        selected_plan:
          metadata?.selectedPlan ??
          (
            metadata?.accountType ===
            "organization"
              ? "developer"
              : "professional"
          ),

        organization_setup_complete: false
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  return supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function signOut() {
  const supabase = createClient();

  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();

  return supabase.auth.getUser();
}

export async function createProfile({
  userId,
  email,
  firstName,
  lastName,
}: ProfileInput) {
  const supabase = createClient();

  return supabase.from("profiles").upsert(
    {
      id: userId,
      email: email.trim().toLowerCase(),
      first_name: firstName?.trim() || null,
      last_name: lastName?.trim() || null,
    },
    {
      onConflict: "id",
    }
  );
}

export async function ensureUserProfile() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      data: null,
      error: userError,
    };
  }

  if (!user) {
    return {
      data: null,
      error: new Error("No authenticated user was found."),
    };
  }

  const { data: existingProfile, error: profileLookupError } =
    await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

  if (profileLookupError) {
    return {
      data: null,
      error: profileLookupError,
    };
  }

  if (existingProfile) {
    return {
      data: existingProfile,
      error: null,
    };
  }

  const firstName =
    typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name
      : null;

  const lastName =
    typeof user.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name
      : null;

  if (!user.email) {
    return {
      data: null,
      error: new Error(
        "The authenticated user does not have an email address."
      ),
    };
  }

  const { data: createdProfile, error: profileCreationError } =
    await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email.trim().toLowerCase(),
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
      })
      .select("id, email, first_name, last_name")
      .single();

  if (profileCreationError) {
    return {
      data: null,
      error: profileCreationError,
    };
  }

  return {
    data: createdProfile,
    error: null,
  };
}

export async function createOrganization({
  name,
  slug,
  createdBy,
}: OrganizationInput) {
  const supabase = createClient();

  return supabase
    .from("organizations")
    .insert({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      created_by: createdBy,
    })
    .select("id, name, slug, created_by")
    .single();
}

export async function createOrganizationMembership({
  organizationId,
  userId,
  role = "owner",
}: OrganizationMembershipInput) {
  const supabase = createClient();

  return supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    })
    .select("id, organization_id, user_id, role")
    .single();
}

export async function getUserWorkspaceStatus(
  userId: string
): Promise<{
  data: UserWorkspaceStatus | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  return {
    data: {
      hasOrganization: Boolean(data?.organization_id),
      organizationId: data?.organization_id ?? null,
      organizationRole: data?.role ?? null,
    },
    error: null,
  };
}

export async function completePendingOrganizationSetup(): Promise<{
  data: OrganizationSetupResult | null;
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
      error: new Error("No authenticated user was found."),
    };
  }

  /*
   * Check membership first. This makes the operation idempotent even
   * if metadata was not updated after a previous successful setup.
   */
  const { data: workspaceStatus, error: workspaceError } =
    await getUserWorkspaceStatus(user.id);

  if (workspaceError) {
    return {
      data: null,
      error: workspaceError,
    };
  }

  if (
    workspaceStatus?.hasOrganization &&
    workspaceStatus.organizationId
  ) {
    await supabase.auth.updateUser({
      data: {
        organization_setup_complete: true,
      },
    });

    return {
      data: {
        organization_id: workspaceStatus.organizationId,
        role: workspaceStatus.organizationRole ?? "member",
        already_existed: true,
      },
      error: null,
    };
  }

  const accountType = user.user_metadata?.account_type;

  /*
   * Individual accounts do not require organization setup.
   */
  if (accountType !== "organization") {
    return {
      data: null,
      error: null,
    };
  }

  const setupComplete =
    user.user_metadata?.organization_setup_complete === true;

  if (setupComplete) {
    return {
      data: null,
      error: null,
    };
  }

  const organizationName =
    typeof user.user_metadata?.organization_name === "string"
      ? user.user_metadata.organization_name.trim()
      : "";

  const organizationSlug =
    typeof user.user_metadata?.organization_slug === "string"
      ? user.user_metadata.organization_slug.trim()
      : "";

  const selectedPlan =
    user.user_metadata?.selected_plan ===
    "enterprise"
      ? "enterprise"
      : "developer";

  if (!organizationName) {
    return {
      data: null,
      error: new Error(
        "The pending organization name could not be found."
      ),
    };
  }

  const finalRequestedSlug =
    organizationSlug || createOrganizationSlug(organizationName);

  const { data, error } = await supabase.rpc(
    "complete_organization_signup",
    {
      p_name: organizationName,
      p_slug: finalRequestedSlug,
      p_plan_id: selectedPlan,
    }
  );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  const result = data as OrganizationSetupResult;

  const { error: metadataUpdateError } =
    await supabase.auth.updateUser({
      data: {
        organization_setup_complete: true,
      },
    });

  if (metadataUpdateError) {
    /*
     * The organization and membership already exist, so this should
     * not block the user. Membership detection prevents duplication
     * on the next login.
     */
    console.error(
      "Organization metadata update failed:",
      metadataUpdateError
    );
  }

  return {
    data: result,
    error: null,
  };
}

export async function verifySignupCode(
  email: string,
  code: string
) {
  const supabase = createClient();

  const result =
    await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });

  if (result.error) {
    console.error(
      "Signup OTP verification failed:",
      {
        message: result.error.message,
        code: result.error.code,
        status: result.error.status,
        name: result.error.name,
      }
    );
  }

  return result;
}

export async function resendSignupCode(
  email: string,
  emailRedirectTo?: string
) {
  const supabase = createClient();

  return supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo,
    },
  });
}

export async function requestPasswordReset(
  email: string,
  redirectTo: string
) {
  const supabase = createClient();

  return supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo,
    }
  );
}

export async function updatePassword(
  password: string
) {
  const supabase = createClient();

  return supabase.auth.updateUser({
    password,
  });
}

export async function finalizeVerifiedSignup(): Promise<{
  data: VerifiedSignupResult | null;
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
      error: new Error(
        "The verified account session could not be found."
      ),
    };
  }

  if (!user.email_confirmed_at) {
    return {
      data: null,
      error: new Error(
        "Please verify your email address before continuing."
      ),
    };
  }

  const {
    error: profileError,
  } = await ensureUserProfile();

  if (profileError) {
    return {
      data: null,
      error: new Error(
        profileError.message
      ),
    };
  }

  const accountType =
    user.user_metadata?.account_type;

  if (accountType === "organization") {
    const organizationResult =
      await completePendingOrganizationSetup();

    return {
      data:
        organizationResult.data as
          | VerifiedSignupResult
          | null,
      error: organizationResult.error,
    };
  }

  const { data, error } =
    await supabase.rpc(
      "finalize_individual_signup"
    );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  return {
    data:
      data as VerifiedSignupResult,
    error: null,
  };
}