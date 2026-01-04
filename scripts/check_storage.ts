
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    });
} catch (e) {
    console.error('Could not load .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables. URL:', !!supabaseUrl, 'Key:', !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Checking storage access...');

    // 1. Try to list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError.message);
        console.log('You likely need to create the "avatars" bucket in your Supabase dashboard.');
    } else {
        console.log('Buckets found:', buckets.map(b => b.name));

        // 2. Check for avatars bucket
        const avatarsBucket = buckets.find(b => b.name === 'avatars');
        if (avatarsBucket) {
            console.log('✅ "avatars" bucket exists.');
            if (avatarsBucket.public) {
                console.log('✅ "avatars" bucket is public.');
            } else {
                console.log('⚠️ "avatars" bucket exists but is NOT public. Images might not load for others.');
            }
        } else {
            console.log('❌ "avatars" bucket is MISSING.');
        }
    }
}

checkStorage();
