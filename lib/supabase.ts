import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "sb_publishable_T4ZnLiPeIQ6-HylURhD5eQ_bjFY7LbT";
const supabaseKey = "sb_secret_KeOec8IfoIRIxIEigtnt6A_SrTBsU16";

export const supabase = createClient(supabaseUrl, supabaseKey);