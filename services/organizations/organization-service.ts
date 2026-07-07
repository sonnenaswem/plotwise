import { createClient } from "@/lib/supabase/client";
import {
  createOrganization as createAuthOrganization,
  createOrganizationMembership,
  createOrganizationSlug,
} from "@/services/auth/auth-service";

export type OrganizationRole =
  | "owner"
  | "admin"
  | "member";

export type OrganizationWorkspace = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrganizationRole;
  createdAt: string | null;
};

export type OrganizationInvitationStatus =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired";

export type OrganizationInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "member";
  token: string;
  status: OrganizationInvitationStatus;
  expiresAt: string;
  createdAt: string;
};

export type InvitationPreview = {
  organizationName: string;
  email: string;
  role: "admin" | "member";
  status: OrganizationInvitationStatus;
  expiresAt: string;
};

export type OrganizationMember = {
  membershipId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
};

type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string | null;
};

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

type CreateInvitationRpcResponse = {
  id: string;
  organization_id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  status: OrganizationInvitationStatus;
  expires_at: string;
  created_at: string;
};

type InvitationPreviewRpcResponse = {
  organization_name: string;
  email: string;
  role: "admin" | "member";
  status: OrganizationInvitationStatus;
  expires_at: string;
};

type AcceptInvitationRpcResponse = {
  organization_id: string;
  role: string;
  already_member: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRole(role: string): OrganizationRole {
  if (role === "owner" || role === "admin") {
    return role;
  }

  return "member";
}

function createDisplayName(profile: ProfileRow) {
  const fullName = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || profile.email;
}

export async function createOrganization(
  name: string,
  userId: string
): Promise<{
  data: {
    organizationId: string;
  } | null;
  error: Error | null;
}> {
  const normalizedName = name.trim();
  const normalizedUserId = userId.trim();

  if (!normalizedName) {
    return {
      data: null,
      error: new Error("Organization name is required."),
    };
  }

  if (!normalizedUserId) {
    return {
      data: null,
      error: new Error("User ID is required."),
    };
  }

  const organizationResult = await createAuthOrganization({
    name: normalizedName,
    slug: createOrganizationSlug(normalizedName),
    createdBy: normalizedUserId,
  });

  if (organizationResult.error) {
    return {
      data: null,
      error: new Error(organizationResult.error.message),
    };
  }

  if (!organizationResult.data?.id) {
    return {
      data: null,
      error: new Error("The organization could not be created."),
    };
  }

  const membershipResult =
    await createOrganizationMembership({
      organizationId: organizationResult.data.id,
      userId: normalizedUserId,
      role: "owner",
    });

  if (membershipResult.error) {
    return {
      data: null,
      error: new Error(membershipResult.error.message),
    };
  }

  return {
    data: {
      organizationId: organizationResult.data.id,
    },
    error: null,
  };
}

export async function getCurrentWorkspace(): Promise<{
  data: OrganizationWorkspace | null;
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
        "You must be signed in to access workspace settings."
      ),
    };
  }

  const { data: membership, error: membershipError } =
    await supabase
      .from("organization_members")
      .select(
        `
          id,
          organization_id,
          user_id,
          role,
          created_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  if (membershipError) {
    return {
      data: null,
      error: new Error(membershipError.message),
    };
  }

  if (!membership) {
    return {
      data: null,
      error: null,
    };
  }

  const membershipRow =
    membership as MembershipRow;

  const { data: organization, error: organizationError } =
    await supabase
      .from("organizations")
      .select("id, name, slug, created_at")
      .eq(
        "id",
        membershipRow.organization_id
      )
      .maybeSingle();

  if (organizationError) {
    return {
      data: null,
      error: new Error(
        organizationError.message
      ),
    };
  }

  if (!organization) {
    return {
      data: null,
      error: new Error(
        "Your organization workspace could not be found."
      ),
    };
  }

  const organizationRow =
    organization as OrganizationRow;

  return {
    data: {
      organizationId: organizationRow.id,
      organizationName: organizationRow.name,
      organizationSlug: organizationRow.slug,
      role: normalizeRole(membershipRow.role),
      createdAt: organizationRow.created_at,
    },
    error: null,
  };
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<{
  data: OrganizationMember[];
  error: Error | null;
}> {
  const supabase = createClient();

  const normalizedOrganizationId =
    organizationId.trim();

  if (!normalizedOrganizationId) {
    return {
      data: [],
      error: new Error(
        "Organization ID is required."
      ),
    };
  }

  const { data: memberships, error: membershipsError } =
    await supabase
      .from("organization_members")
      .select(
        `
          id,
          organization_id,
          user_id,
          role,
          created_at
        `
      )
      .eq(
        "organization_id",
        normalizedOrganizationId
      )
      .order("created_at", {
        ascending: true,
      });

  if (membershipsError) {
    return {
      data: [],
      error: new Error(
        membershipsError.message
      ),
    };
  }

  const membershipRows =
    (memberships ?? []) as MembershipRow[];

  if (membershipRows.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  const userIds = membershipRows.map(
    (membership) => membership.user_id
  );

  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select(
        `
          id,
          email,
          first_name,
          last_name
        `
      )
      .in("id", userIds);

  if (profilesError) {
    return {
      data: [],
      error: new Error(profilesError.message),
    };
  }

  const profileRows =
    (profiles ?? []) as ProfileRow[];

  const profilesById = new Map(
    profileRows.map((profile) => [
      profile.id,
      profile,
    ])
  );

  const members = membershipRows.map(
    (membership): OrganizationMember => {
      const profile = profilesById.get(
        membership.user_id
      );

      const fallbackEmail =
        "Profile unavailable";

      return {
        membershipId: membership.id,
        userId: membership.user_id,
        role: normalizeRole(membership.role),
        joinedAt: membership.created_at,
        email:
          profile?.email ?? fallbackEmail,
        firstName:
          profile?.first_name ?? null,
        lastName:
          profile?.last_name ?? null,
        displayName: profile
          ? createDisplayName(profile)
          : fallbackEmail,
      };
    }
  );

  return {
    data: members,
    error: null,
  };
}

export async function getCurrentWorkspaceWithMembers(): Promise<{
  data: {
    workspace: OrganizationWorkspace | null;
    members: OrganizationMember[];
  } | null;
  error: Error | null;
}> {
  const workspaceResult =
    await getCurrentWorkspace();

  if (workspaceResult.error) {
    return {
      data: null,
      error: workspaceResult.error,
    };
  }

  if (!workspaceResult.data) {
    return {
      data: {
        workspace: null,
        members: [],
      },
      error: null,
    };
  }

  const membersResult =
    await getOrganizationMembers(
      workspaceResult.data.organizationId
    );

  if (membersResult.error) {
    return {
      data: null,
      error: membersResult.error,
    };
  }

  return {
    data: {
      workspace: workspaceResult.data,
      members: membersResult.data,
    },
    error: null,
  };
}

export async function createOrganizationInvitation(
  organizationId: string,
  email: string,
  role: "admin" | "member"
): Promise<{
  data: OrganizationInvitation | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      data: null,
      error: new Error(
        "Email address is required."
      ),
    };
  }

  const { data, error } = await supabase.rpc(
    "create_organization_invitation",
    {
      p_organization_id: organizationId,
      p_email: normalizedEmail,
      p_role: role,
    }
  );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!isRecord(data)) {
    return {
      data: null,
      error: new Error("The invitation response was invalid."),
    };
  }

  const invitation = data as CreateInvitationRpcResponse;

  return {
    data: {
      id: invitation.id,
      organizationId: invitation.organization_id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    },
    error: null,
  };
}

export async function getOrganizationInvitations(
  organizationId: string
): Promise<{
  data: OrganizationInvitation[];
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_organization_invitations",
    {
      p_organization_id: organizationId,
    }
  );

  if (error) {
    return {
      data: [],
      error: new Error(error.message),
    };
  }

  const invitationRows = Array.isArray(data)
    ? (data as CreateInvitationRpcResponse[])
    : [];

  return {
    data: invitationRows.map(
      (invitation): OrganizationInvitation => ({
        id: invitation.id,
        organizationId:
          invitation.organization_id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at,
      })
    ),
    error: null,
  };
}

export async function revokeOrganizationInvitation(
  invitationId: string
): Promise<{
  data: boolean;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "revoke_organization_invitation",
    {
      p_invitation_id: invitationId,
    }
  );

  if (error) {
    return {
      data: false,
      error: new Error(error.message),
    };
  }

  return {
    data: Boolean(data),
    error: null,
  };
}

export async function getInvitationPreview(
  token: string
): Promise<{
  data: InvitationPreview | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_invitation_preview",
    {
      p_token: token,
    }
  );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!data) {
    return {
      data: null,
      error: null,
    };
  }

  if (!isRecord(data)) {
    return {
      data: null,
      error: new Error("The invitation preview response was invalid."),
    };
  }

  const preview = data as InvitationPreviewRpcResponse;

  return {
    data: {
      organizationName:
        preview.organization_name,
      email: preview.email,
      role: preview.role,
      status: preview.status,
      expiresAt: preview.expires_at,
    },
    error: null,
  };
}

export async function acceptOrganizationInvitation(
  token: string
): Promise<{
  data: {
    organizationId: string;
    role: string;
    alreadyMember: boolean;
  } | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "accept_organization_invitation",
    {
      p_token: token,
    }
  );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!isRecord(data)) {
    return {
      data: null,
      error: new Error("The invitation acceptance response was invalid."),
    };
  }

  const acceptedInvitation =
    data as AcceptInvitationRpcResponse;

  return {
    data: {
      organizationId:
        acceptedInvitation.organization_id,
      role: acceptedInvitation.role,
      alreadyMember:
        Boolean(acceptedInvitation.already_member),
    },
    error: null,
  };
}
