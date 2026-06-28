import { createClient } from "@/lib/supabase/client";


export async function createProject(
  address: string,
  borough: string,
  projectType: string,
  userId: string
) {

  const supabase = createClient();


  const { data, error } =
    await supabase
      .from("projects")
      .insert({
        address,
        borough,
        project_type: projectType,
        created_by: userId,
      })
      .select()
      .single();


  console.log(
    "PROJECT INSERT",
    {
      data,
      error
    }
  );


  return {
    data,
    error
  };
}



export async function getProjects(
  userId: string
) {

  const supabase = createClient();


  const { data, error } =
    await supabase
      .from("projects")
      .select("*")
      .eq(
        "created_by",
        userId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );


  return {
    data:data ?? [],
    error
  };
}