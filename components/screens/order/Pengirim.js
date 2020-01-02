import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Image } from "react-native";
import styles from "./styles";
import { Header } from 'react-navigation-stack';
import { Layout, Text, Input, Button, ListItem } from '@ui-kitten/components';
import SearchableDropdown from 'react-native-searchable-dropdown';
import api from "../../api";

const Judul = ({ navigation }) => (
	<View>
		<Text style={styles.header}>{navigation.deskripsiOrder.jenis}</Text>
		<Text style={{fontFamily: 'open-sans-reg'}}>Kelola data pengirim</Text>
	</View>
)


class Pengirim extends React.Component{
	static navigationOptions = ({ navigation }) => ({
		headerTitle: <Judul navigation={navigation.state.params}/>
	}) 

	namaRef = React.createRef();
	alamatRef = React.createRef();
	alamat2Ref = React.createRef();
	emailRef = React.createRef();
	phoneRef = React.createRef();

	state = {
		data:{
			nama: '',
			alamat: '',
			kodepos: '',
			alamat2: '',
			email: '',
			nohp: ''
		},
	    loadingProv: false,
    	listAlamat: [],
    	show: false,
    	errors: {}
	}

	onChangeAlamat = (text) => {
		clearTimeout(this.timer);
		this.setState({ data: { ...this.state.data, alamat: text}});
		if (text.length >= 6) {
			this.timer = setTimeout(this.getAlamat, 500);
		}
	} 

	getAlamat = () => {
		if (!this.state.data.alamat) return;
		this.setState({ loadingProv: true });
		api.qob.getAlamat(this.state.data.alamat)
			.then(res => {
				const listAlamat = [];
				res.forEach(x => {
					listAlamat.push({
						title: x.text.replace('   ',''),
						kodepos: x.id
					})
				})
				this.setState({ listAlamat, show: true });
			})
			.catch(err => console.log(err))
			// .catch(err => console.log("failed"))
	}


	onSubmit = () => {
		const errors = this.validate(this.state.data);
		this.setState({ errors });
		if (Object.keys(errors).length === 0) {
			this.props.navigation.navigate({
				routeName: 'OrderPenerima',
				params: {
					...this.props.navigation.state.params,
					deskripsiPengirim: this.state.data
				}
			})
		}else{
			if (errors.nama){
				this.namaRef.current.focus();	
			}else if (errors.alamat){
				this.alamatRef.current.focus();
			}else if (errors.alamat2){
				this.alamat2Ref.current.focus();
			}else if (errors.email) {
				this.emailRef.current.focus();
			}else{
				this.phoneRef.current.focus();
			}
		}
	}

	onChange = (e, { name }) => this.setState({ data: { ...this.state.data, [name]: e }})

	
	renderIcon = (style) => (
	    <Image 
	    	source={require('../../icons/location.png')}
	    />
	)

	onClickAlamat = (title, kodepos) => {
		this.setState({ 
			data: { ...this.state.data, alamat: title, kodepos: kodepos}, 
			show: false
		});
		this.alamat2Ref.current.focus()	
	}

	validate = (data) => {
		const errors = {};
		if (!data.nama) errors.nama = "Harap diisi";
		if (!data.alamat) errors.alamat = "Harap diisi";
		if (!data.alamat2) errors.alamat2 = "Harap diisi";
		if (!data.email) errors.email = "Harap diisi";
		if (!data.nohp) errors.nohp = "Harap diisi";
		return errors;
	}

	render(){
		const { loadingProv, data, listAlamat, show, errors } = this.state;
		
		return(
			<KeyboardAvoidingView 
					style={{flex:1}} 
					behavior="padding" 
					keyboardVerticalOffset = {Header.HEIGHT + 40}
					enabled
				>
				<ScrollView nestedScrollEnabled={true}>
					<Layout style={styles.container}>
						<View style={{padding: 4}}>
							<Input
						      placeholder='Nama'
						      ref={this.namaRef}
						      name='nama'
						      label='Name Pengirim'
						      labelStyle={styles.label}
						      value={data.nama}
						      style={{paddingTop: 7}}
						      onChangeText={(e) => this.onChange(e, this.namaRef.current.props)}
						      onSubmitEditing={() => this.alamatRef.current.focus() }
						      status={errors.nama && 'danger'}
						    />
						    <Input 
						    	placeholder='Alamat (kota/kab/kec/kel)'
						    	ref={this.alamatRef}
						    	label='Alamat'
						    	labelStyle={styles.label}
						    	style={{paddingTop: 7}}
						    	value={data.alamat}
						    	onChangeText={this.onChangeAlamat}
						    	icon={this.renderIcon}
						    	status={errors.alamat && 'danger'}
						    />
						    { listAlamat.length > 0 && show && <ScrollView style={{height: 100}} nestedScrollEnabled={true}>
							    <View style={styles.triangle}>
								   	{ listAlamat.map((x, i) => 
								   		<ListItem
								   			key={i}
									    	style={styles.listItem}
									    	titleStyle={styles.listItemTitle}
									    	descriptionStyle={styles.listItemDescription}
									    	title={x.title}
									    	onPress={() => this.onClickAlamat(x.title, x.kodepos)}
										/> )}
							    </View>
						    </ScrollView> }
						    <Input 
						    	placeholder='Alamat (jalan, gang, rt/rw)'
						    	ref={this.alamat2Ref}
						    	name='alamat2'
						    	label='Alamat'
						    	style={{ paddingTop: 7 }}
						    	labelStyle={styles.label}
						    	value={data.alamat2}
						    	icon={this.renderIcon}
						    	onChangeText={(e) => this.onChange(e, this.alamat2Ref.current.props)}
						    	onSubmitEditing={() => this.emailRef.current.focus() }
						    	status={errors.alamat2 && 'danger'}
						    />
						    <Input 
						    	placeholder='Masukan email'
						    	ref={this.emailRef}
						    	name='email'
						    	label='Email'
						    	style={{ paddingTop: 7 }}
						    	labelStyle={styles.label}
						    	value={data.email}
						    	onChangeText={(e) => this.onChange(e, this.emailRef.current.props)}
						    	onSubmitEditing={() => this.phoneRef.current.focus() }
						    	status={errors.email && 'danger'}
						    />
						     <Input 
						    	placeholder='Masukan nomor handphone'
						    	ref={this.phoneRef}
						    	name='nohp'
						    	label='No Handphone'
						    	style={{ paddingTop: 7 }}
						    	labelStyle={styles.label}
						    	value={data.nohp}
						    	onChangeText={(e) => this.onChange(e, this.phoneRef.current.props)}
						    	onSubmitEditing={this.onSubmit}
						    	status={errors.nohp && 'danger'}
						    />
						</View>
						<Button style={{margin: 2}} onPress={this.onSubmit}>Selanjutnya</Button>
					</Layout>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default Pengirim;