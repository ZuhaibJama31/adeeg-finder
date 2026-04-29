import React, { useState } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';

export default function NewBookingScreen(){
 const colors = useColors();
 const { user } = useAuth();
 const queryClient = useQueryClient();
 const params = useLocalSearchParams<{workerId?:string;workerName?:string}>();
 const workerId = Number(params.workerId || 0);
 const [description,setDescription]=useState('');
 const [address,setAddress]=useState('');
 const [city,setCity]=useState(user?.city ?? '');
 const [scheduledDate,setScheduledDate]=useState(new Date());
 const [showIOS,setShowIOS]=useState(false);
 const [error,setError]=useState('');

 const openAndroidPicker=()=>{
  DateTimePickerAndroid.open({value:scheduledDate,mode:'date',minimumDate:new Date(),onChange:(_,d)=>{
   if(!d) return;
   DateTimePickerAndroid.open({value:d,mode:'time',onChange:(_,t)=>{
    if(!t) return;
    const finalDate=new Date(d);
    finalDate.setHours(t.getHours(), t.getMinutes(),0,0);
    setScheduledDate(finalDate);
   }});
  }});
 };

 const mutation = useMutation({
  mutationFn:()=>apiRequest('/bookings',{method:'POST',body:{worker_id:workerId,description,address,city,scheduled_at:scheduledDate.toISOString()}}),
  onSuccess:(data:any)=>{queryClient.invalidateQueries({queryKey:['bookings']}); router.replace(`/booking/${data?.booking?.id ?? ''}`)}
 });

 return <View style={{flex:1,backgroundColor:colors.background}}>
  <Stack.Screen options={{title:'Book a Service'}} />
  <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
   <Card>
    <View style={styles.row}><Avatar name={params.workerName ?? 'Pro'} size={52} />
      <View><Text style={[styles.small,{color:colors.mutedForeground}]}>Booking with</Text><Text style={[styles.title,{color:colors.foreground}]}>{params.workerName ?? ''}</Text></View>
    </View>
   </Card>

   <Text style={[styles.label,{color:colors.foreground}]}>Schedule</Text>
   <Pressable style={[styles.box,{borderColor:colors.border,backgroundColor:colors.card}]} onPress={()=>Platform.OS==='android'?openAndroidPicker():setShowIOS(v=>!v)}>
    <Text style={{color:colors.foreground,fontWeight:'600'}}>{formatDateTime(scheduledDate.toISOString())}</Text>
   </Pressable>
   {Platform.OS==='ios' && showIOS && <DateTimePicker value={scheduledDate} mode='datetime' display='spinner' onChange={(_,d)=>d&&setScheduledDate(d)} />}

   <Text style={[styles.label,{color:colors.foreground}]}>Describe the Job</Text>
   <Input multiline numberOfLines={5} value={description} onChangeText={setDescription} placeholder='Leak, wiring, painting, cleaning...' style={{minHeight:120,textAlignVertical:'top'}} />

   <Text style={[styles.label,{color:colors.foreground}]}>Location</Text>
   <Input label='Address' value={address} onChangeText={setAddress} placeholder='Street / building / apt' />
   <Input label='City' value={city} onChangeText={setCity} placeholder='Garoowe' errorText={error || undefined} />

   <Button label='Send Booking Request' loading={mutation.isPending} onPress={()=>{
    if(!workerId) return setError('No worker selected');
    if(!description.trim()||!address.trim()||!city.trim()) return setError('Please complete all fields');
    setError(''); mutation.mutate();
   }} />
  </KeyboardAwareScrollViewCompat>
 </View>
}
const styles=StyleSheet.create({content:{padding:20,gap:16,paddingBottom:60},row:{flexDirection:'row',alignItems:'center',gap:12},small:{fontSize:12},title:{fontSize:18,fontWeight:'700'},label:{fontSize:15,fontWeight:'700',marginTop:8},box:{padding:16,borderWidth:1,borderRadius:16}});
