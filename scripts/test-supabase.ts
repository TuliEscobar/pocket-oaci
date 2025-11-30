/**
 * Script de Test para Verificar Configuración de Supabase
 * 
 * Este script verifica que:
 * 1. La conexión a Supabase funciona
 * 2. Todas las tablas existen
 * 3. El bucket de storage existe
 * 4. Se pueden insertar y leer datos de prueba
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabaseAdmin } from '../lib/supabase';

async function testSupabaseSetup() {
    console.log('🧪 Iniciando tests de Supabase...\n');

    try {
        // Test 1: Verificar conexión
        console.log('1️⃣ Verificando conexión...');
        const { data: connectionTest, error: connectionError } = await supabaseAdmin
            .from('users')
            .select('count');

        if (connectionError) {
            console.error('❌ Error de conexión:', connectionError.message);
            return false;
        }
        console.log('✅ Conexión exitosa\n');

        // Test 2: Verificar que existan todas las tablas
        console.log('2️⃣ Verificando tablas...');
        const tables = ['users', 'user_documents', 'chats', 'messages'];

        for (const table of tables) {
            const { error } = await supabaseAdmin
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.error(`❌ Tabla "${table}" no existe o tiene problemas:`, error.message);
                return false;
            }
            console.log(`  ✅ Tabla "${table}" existe`);
        }
        console.log('✅ Todas las tablas existen\n');

        // Test 3: Verificar bucket de storage
        console.log('3️⃣ Verificando Storage Bucket...');
        const { data: buckets, error: bucketError } = await supabaseAdmin
            .storage
            .listBuckets();

        if (bucketError) {
            console.error('❌ Error al listar buckets:', bucketError.message);
            return false;
        }

        const userDocsBucket = buckets?.find(b => b.name === 'user_docs');
        if (!userDocsBucket) {
            console.error('❌ Bucket "user_docs" no existe');
            return false;
        }
        console.log('✅ Bucket "user_docs" existe\n');

        // Test 4: Test de inserción y lectura (usuario de prueba)
        console.log('4️⃣ Test de inserción/lectura...');
        const testUserId = 'test_user_' + Date.now();

        // Insertar usuario de prueba
        const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: testUserId,
                email: 'test@oaci.ai',
                plan: 'free'
            });

        if (insertError) {
            console.error('❌ Error al insertar usuario de prueba:', insertError.message);
            return false;
        }
        console.log('  ✅ Usuario de prueba insertado');

        // Leer usuario de prueba
        const { data: testUser, error: readError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', testUserId)
            .single();

        if (readError || !testUser) {
            console.error('❌ Error al leer usuario de prueba:', readError?.message);
            return false;
        }
        console.log('  ✅ Usuario de prueba leído correctamente');

        // Crear chat de prueba
        const { data: testChat, error: chatError } = await supabaseAdmin
            .from('chats')
            .insert({
                user_id: testUserId,
                title: 'Test Chat'
            })
            .select('id')
            .single();

        if (chatError || !testChat) {
            console.error('❌ Error al crear chat de prueba:', chatError?.message);
            return false;
        }
        console.log('  ✅ Chat de prueba creado');

        // Crear mensaje de prueba
        const { error: messageError } = await supabaseAdmin
            .from('messages')
            .insert({
                chat_id: testChat.id,
                role: 'user',
                content: 'Test message'
            });

        if (messageError) {
            console.error('❌ Error al crear mensaje de prueba:', messageError.message);
            return false;
        }
        console.log('  ✅ Mensaje de prueba creado');

        // Limpiar datos de prueba
        console.log('\n5️⃣ Limpiando datos de prueba...');
        const { error: deleteError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', testUserId);

        if (deleteError) {
            console.error('⚠️  Advertencia: No se pudo eliminar usuario de prueba:', deleteError.message);
        } else {
            console.log('  ✅ Datos de prueba eliminados (cascade)');
        }

        console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
        console.log('\n📊 Resumen:');
        console.log('  ✅ Conexión a Supabase');
        console.log('  ✅ Tablas: users, user_documents, chats, messages');
        console.log('  ✅ Storage Bucket: user_docs');
        console.log('  ✅ Operaciones CRUD funcionando');
        console.log('\n✨ Tu backend está listo para usar!\n');

        return true;

    } catch (error: any) {
        console.error('\n❌ Error inesperado:', error.message);
        console.error(error);
        return false;
    }
}

// Ejecutar tests
testSupabaseSetup()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
