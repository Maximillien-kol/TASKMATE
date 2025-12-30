-- Create profile for existing user
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
