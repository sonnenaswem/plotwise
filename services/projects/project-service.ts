import { createClient } from "@/lib/supabase/client";

export type Project = {
  id: string;
  organization_id: string | null;
  address: string;
  borough: string | null;
  latitude: number | null;
  longitude: number | null;
  project_type: string;
  created_by: string | null;
  created_at: string | null;
  floor_area: number | null;
  storeys: number | null;
  heritage_impact: boolean | null;
};

export type CreateProjectInput = {
  address: string;
  borough?: string;
  projectType: string;
  latitude?: number | null;
  longitude?: number | null;
  floorArea?: number | null;
  storeys?: number | null;
  heritageImpact?: boolean | null;
};

type OrganizationMembership = {
  organization_id: string;
  role: string;
};

async function getAuthenticatedUserId() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      userId: null,
      error: new Error(error.message),
    };
  }

  if (!user) {
    return {
      userId: null,
      error: new Error("You must be signed in to access projects."),
    };
  }

  return {
    userId: user.id,
    error: null,
  };
}

export async function getCurrentOrganizationMembership(): Promise<{
  data: OrganizationMembership | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { userId, error: userError } =
    await getAuthenticatedUserId();

  if (userError || !userId) {
    return {
      data: null,
      error:
        userError ??
        new Error("The authenticated user could not be loaded."),
    };
  }

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
    data: data ?? null,
    error: null,
  };
}

export async function createProject(
  input: CreateProjectInput
): Promise<{
  data: Project | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const normalizedAddress = input.address.trim();
  const normalizedBorough = input.borough?.trim() || null;
  const normalizedProjectType = input.projectType.trim();

  if (!normalizedAddress) {
    return {
      data: null,
      error: new Error("Project address is required."),
    };
  }

  if (!normalizedProjectType) {
    return {
      data: null,
      error: new Error("Project type is required."),
    };
  }

  const { userId, error: userError } =
    await getAuthenticatedUserId();

  if (userError || !userId) {
    return {
      data: null,
      error:
        userError ??
        new Error("The authenticated user could not be loaded."),
    };
  }

  /*
   * An organization user creates the project inside their organization.
   * An individual user has no membership, so organization_id remains null.
   */
  const {
    data: membership,
    error: membershipError,
  } = await getCurrentOrganizationMembership();

  if (membershipError) {
    return {
      data: null,
      error: membershipError,
    };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      address: normalizedAddress,
      borough: normalizedBorough,
      project_type: normalizedProjectType,
      created_by: userId,
      organization_id: membership?.organization_id ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      floor_area: input.floorArea ?? null,
      storeys: input.storeys ?? null,
      heritage_impact: input.heritageImpact ?? null,
    })
    .select(
      `
        id,
        organization_id,
        address,
        borough,
        latitude,
        longitude,
        project_type,
        created_by,
        created_at,
        floor_area,
        storeys,
        heritage_impact
      `
    )
    .single();

  if (error) {
    console.error("PROJECT INSERT FAILED", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return {
      data: null,
      error: new Error(error.message),
    };
  }

  console.log("PROJECT INSERT SUCCEEDED", {
    projectId: data.id,
    organizationId: data.organization_id,
    createdBy: data.created_by,
  });

  return {
    data: data as Project,
    error: null,
  };
}

export async function getProjects(): Promise<{
  data: Project[];
  error: Error | null;
}> {
  const supabase = createClient();

  const { userId, error: userError } =
    await getAuthenticatedUserId();

  if (userError || !userId) {
    return {
      data: [],
      error:
        userError ??
        new Error("The authenticated user could not be loaded."),
    };
  }

  /*
   * Do not filter only by created_by.
   *
   * The existing projects SELECT policy already allows:
   * - personal projects owned by this user;
   * - organization projects accessible through organization_members.
   *
   * Supabase RLS is therefore the source of truth for project visibility.
   */
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        organization_id,
        address,
        borough,
        latitude,
        longitude,
        project_type,
        created_by,
        created_at,
        floor_area,
        storeys,
        heritage_impact
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("PROJECT FETCH FAILED", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return {
      data: [],
      error: new Error(error.message),
    };
  }

  return {
    data: (data ?? []) as Project[],
    error: null,
  };
}

export async function getProjectById(
  projectId: string
): Promise<{
  data: Project | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const normalizedProjectId = projectId.trim();

  if (!normalizedProjectId) {
    return {
      data: null,
      error: new Error("Project ID is required."),
    };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        organization_id,
        address,
        borough,
        latitude,
        longitude,
        project_type,
        created_by,
        created_at,
        floor_area,
        storeys,
        heritage_impact
      `
    )
    .eq("id", normalizedProjectId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!data) {
    return {
      data: null,
      error: new Error(
        "The project was not found or you do not have access to it."
      ),
    };
  }

  return {
    data: data as Project,
    error: null,
  };
}