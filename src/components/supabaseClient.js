// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kxxktugyeerctxcnfwwz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGt0dWd5ZWVyY3R4Y25md3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTk1ODEsImV4cCI6MjA1OTE5NTU4MX0.qRNET9cms0xyY_vrjL3fk82DDFtWNsyXIP675WwTTGs'
export const supabase = createClient(supabaseUrl, supabaseKey)