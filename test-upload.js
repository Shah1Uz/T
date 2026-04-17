const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase Diagnostics:");
console.log("- URL:", supabaseUrl);
console.log("- Key present:", !!supabaseKey);
console.log("- Key starts with 'eyJ':", supabaseKey?.startsWith("eyJ"));
console.log("- Key prefix:", supabaseKey?.substring(0, 15));

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    // 1. List buckets
    console.log("\nTesting List Buckets...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("List Buckets Error:", bucketsError.message, bucketsError);
    } else {
      console.log("Buckets found:", buckets.map(b => b.name).join(", "));
    }

    // 2. Try to upload a dummy file
    const bucket = "images";
    const fileName = `test-${Date.now()}.txt`;
    const filePath = `diagnostics/${fileName}`;
    const content = "Supabase storage test content";

    console.log(`\nTesting Upload to bucket '${bucket}' at path '${filePath}'...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, Buffer.from(content), {
        contentType: "text/plain",
        upsert: true
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError.message, uploadError);
    } else {
      console.log("Upload Success!", uploadData);
      
      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      console.log("Public URL:", publicUrl);

      // 4. Cleanup (optional)
      // await supabase.storage.from(bucket).remove([filePath]);
    }
  } catch (err) {
    console.error("Catastrophic error:", err);
  }
}

testStorage();
