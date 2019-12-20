import React from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Image, Platform } from "react-native";
import { SafeAreaView } from 'react-navigation';
import { connect } from "react-redux";
import styles from "./styles";
import { Input, Button, Select } from '@ui-kitten/components';
import kepercayaan from "../../json/agama";
import pekerjaan from "../../json/pekerjaan";
import status from "../../json/status";
import penghasilan from "../../json/penghasilan";
import sumber from "../../json/sumber";
import tujuan from "../../json/tujuan";
import Loader from "../../Loader";
import md5 from "react-native-md5";
import { convertDate } from "../../utils/helper";
import { registerKtp, removeError } from "../../../actions/register";
import Modal from "../../Modal";


const SubTitle = ({ judul }) => (
		<Text>
			{!judul.judulHeader ? "Data tidak ditemukan" : judul.judulHeader }
		</Text>
	)
const Judul = ({ navigation }) => {
	const { state } = navigation;	
	return(
		<View>
			<Text style = {{fontSize: 16, fontWeight: '700'}}>Registrasi</Text>
			{ !state.params ? <Text>Loading..</Text> : <SubTitle judul={state.params} /> }			
		</View>
	);
}

class RegistrasiKtp extends React.Component{
	static navigationOptions = ({ navigation }) => ({
		headerTitle: <Judul navigation={navigation}/>
	}) 

	state = {
		'validateMother': {
			text: '',
			success: false,
			loading: false
		},
		bug: {},
		data: {
			namaPanggilan: '',
			noHp: '',
			npwp: '',
			email: '',
			imei: '',
			kodepos: '',
			gender: '',
			kepercayaan: '',
			pekerjaan: '',
			status: '',
			penghasilan: '',
			sumber: '',
			tujuan: '',
			username: '',
			password: '',
			nmOlshop: ''
		},
		secureTextEntry: true,
		errorsState: {},
		loading: false,
		modal: true
	}

	usernameRef = React.createRef();
	passwordRef = React.createRef();
	nmOlshopRef = React.createRef();
	namaPanggilanRef = React.createRef();
	noHpRef = React.createRef();
	npwpRef = React.createRef();
	emailRef = React.createRef();
	imeiRef = React.createRef();
	kodeposRef = React.createRef();

	componentDidMount(){
		const { ktp } = this.props.dataktp;
		const errors = this.props.errr;
		if (Object.keys(ktp).length > 0 && Object.keys(errors).length === 0) {
			this.props.navigation.setParams({
				judulHeader: ktp.nik
			});
			// console.log("oke");
		}else{
			this.props.navigation.setParams({
				judulHeader: undefined
			});
		}
	}

	onChange = (e) => this.setState({ validateMother: { ...this.state.validateMother, text: e }})

	onValidate = (e) => {
		const bug = this.validate(this.state.validateMother.text);
		this.setState({ bug });
		if (Object.keys(bug).length === 0) {
			this.setState({ validateMother: { ...this.state.validateMother, success: true }})
			//handle null object
			setTimeout(() => this.usernameRef.current.focus(), 500)
		}
	}

	validate = (name) => {
		const bug = {};
		const { motherName } = this.props.dataktp.ktp;
		
		if (!name) bug.validate = "Harap validasi data ktp anda";
		if (name) {
			if (name.toLowerCase() !== motherName.toLowerCase()) bug.validate = "Nama ibu tidak valid";
		}
		return bug;
	}

	onChangeText = (e, ref) => {
		const { current: {props: { name }}} = ref;
		this.setState({ data: { ...this.state.data, [name]: e }})
	} 
	//console.log(e, ref.current.props.name)

	onSelectText = ({ name, value }) => {
		// const key = this.getKeyByName(name, value);
		this.setState({ 
			data: { ...this.state.data, [name]: value },
			// selectedOption: {
			// 	...this.state.selectedOption,
			// 	[name]: key
			// }
		})
	}

	renderIcon = (style) => {
		const { secureTextEntry } = this.state;
		return(
			<Image
		      style={style} 
		      source={ secureTextEntry ? require('../../icons/eye-off-outline.png') : require('../../icons/eye-outline.png')}
		    />
		);
	}

	onIconPress = () => {
		const { secureTextEntry } = this.state;
		if (secureTextEntry) {
			this.setState({ secureTextEntry: false });
		}else{
			this.setState({ secureTextEntry: true });
		}
	}

	onSubmit = () => {
		const errorsState = this.validateBiodata(this.state.data);
		this.setState({ errorsState });
		if (Object.keys(errorsState).length === 0) {
			this.setState({ loading: true, modal: true });
			const { ktp } 	= this.props.dataktp;
			const { data }	= this.state;
			const pass 		= md5.hex_md5(data.password);
			const tglLahir 	= convertDate(ktp.birtDate);
			const gender 	= ktp.gender === 'Perempuan' ? 'W' : 'P';
			const param1	= `${data.username}|${pass}|${ktp.fullname}|${data.namaPanggilan}|${data.noHp}|${data.email}|${data.npwp}|${data.imei}`;
			const param2 	= `${ktp.birthPlace}|${tglLahir}|${gender}|${data.kepercayaan}|${data.pekerjaan}|${data.status}|1|${ktp.nik}|30/12/2050|${ktp.alamat}|${ktp.rt}|${ktp.rw}|${ktp.desa}|${ktp.kec}|${ktp.city}|${ktp.prov}|${data.kodepos}|${data.tujuan}|${data.sumber}|${data.penghasilan}|${ktp.motherName}`;
			const param3 	= `${data.nmOlshop}|qwerty|${ktp.alamat}|${ktp.desa}|${ktp.kec}|${ktp.city}|${ktp.prov}|${data.kodepos}`;
			const payload	= {
				params1: param1,
				params2: param2,
				params3: param3
			}

			console.log(payload);

			this.props.registerKtp(payload)
				.then(res => this.setState({ loading: false }))
				.catch(err => {
					console.log(err);
					this.setState({ loading: false })
				})
		}else{
			this.usernameRef.current.focus();
		}
	}

	closeModal = () => {
		this.setState({ modal: false });
		this.props.removeError();
	}

	validateBiodata = (data) => {
		const errorsState = {};
		if (!data.username) errorsState.username = "Username tidak boleh kosong";
		if (!data.password) errorsState.password = "Password tidak boleh kosong";
		if (!data.noHp) errorsState.noHp = "Nomor handphone tidak boleh kosong";
		if (!data.npwp) errorsState.npwp = "Npwp tidak boleh kosong";
		if (!data.email) errorsState.email = "Npwp tidak boleh kosong";
		if (!data.nmOlshop) errorsState.nmOlshop = "Nama online shop tidak boleh kosong";
		if (!data.namaPanggilan) errorsState.namaPanggilan = "Nama panggilan tidak boleh kosong";
		if (!data.imei) errorsState.imei = "Imei tidak boleh kosong";
		if (!data.kodepos) errorsState.kodepos = "Kodepos tidak boleh kosong";
		if (!data.kepercayaan) errorsState.kepercayaan = "Kepercayaan belum dipilih";
		if (!data.pekerjaan) errorsState.pekerjaan = "Pekerjaan belum dipilih";
		if (!data.status) errorsState.status = "Status perkawinan belum dipilih";
		if (!data.penghasilan) errorsState.penghasilan = "Penghasilan belum dipilih";
		if (!data.sumber) errorsState.sumber = "Penghasilan belum dipilih";
		if (!data.tujuan) errorsState.tujuan = "Tujuan penghasilan belum dipilih";
		return errorsState;
	}

	render(){
		const { ktp } = this.props.dataktp;
		const { validateMother, bug, data, secureTextEntry, errorsState, loading } = this.state;
		const errors  = this.props.errr; 
		const { errr2 } = this.props;
		return(
			<SafeAreaView>
				{ Object.keys(errors).length > 0 && <View style={styles.message}>
					<View style={{margin: 8}}>
						<Text>{errors.ktp.text}!</Text>
						<Text>Harap pastikan bahwa nomor ktp yang dientri sudah benar</Text>
					</View>
				</View>}
				<Loader loading={loading} />
				<KeyboardAvoidingView 
					behavior="padding" 
					style={styles.container}
					keyboardVerticalOffset={
					  Platform.select({
					     ios: () => 0,
					     android: () => 90
					  })()
					}
				>
				<ScrollView>
					{Object.keys(ktp).length > 0 && Object.keys(errors).length === 0 && 
						<View style={styles.centerForm}>
							<Input
								label='Validasi'
								placeholder='Masukan nama ibu kandung anda disinii'
								labelStyle={styles.labelRed}
								value={validateMother.text}
								onChangeText={this.onChange}
								autoFocus
								size='small'
								status={bug.validate && 'danger' }
							/>
							{ bug.validate && <Text style={styles.labelErr}>{bug.validate}</Text> }
							<Input
								placeholder='Nama Lengkap'
								label='Nama'
								labelStyle={styles.label}
								value={ktp.fullname}
								disabled={true}
								size='small'
							/>
							<Button 
								size='small' 
								style={styles.button}
								onPress={this.onValidate}
								disabled={validateMother.success}
							>Validasi</Button>
							{ validateMother.success && <View style={{paddingTop: 10}}>
									<Input
								    	ref={this.usernameRef}
										placeholder='Masukan username'
										label='Username'
										name='username'
										value={data.username}
										labelStyle={styles.label}
										onChangeText={(e) => this.onChangeText(e, this.usernameRef)}
										size='small'
										status={errorsState.username && 'danger' }
										onSubmitEditing={() => this.passwordRef.current.focus() }
									/>
									{ errorsState.username && <Text style={styles.labelErr}>{errorsState.username}</Text> }
									<Input
									  ref={this.passwordRef}
									  value={data.password}
									  labelStyle={styles.label}
									  label='Password'
									  name='password'
									  size='small'
									  placeholder='********'
									  icon={this.renderIcon}
									  status={errorsState.password && 'danger'}
									  secureTextEntry={secureTextEntry}
									  onIconPress={this.onIconPress}
									  onChangeText={(e) => this.onChangeText(e, this.passwordRef)}
									  onSubmitEditing={() => this.nmOlshopRef.current.focus() }
									/>
									{ errorsState.password && <Text style={styles.labelErr}>{errorsState.password}</Text> }
									<Input
								    	ref={this.nmOlshopRef}
										placeholder='Masukan nama online shop'
										label='Nama Online Shop'
										value={data.nmOlshop}
										name='nmOlshop'
										labelStyle={styles.label}
										onChangeText={(e) => this.onChangeText(e, this.nmOlshopRef)}
										status={errorsState.nmOlshop && 'danger'}
										size='small'
										onSubmitEditing={() => this.namaPanggilanRef.current.focus() }
									/>
									{ errorsState.nmOlshop && <Text style={styles.labelErr}>{errorsState.nmOlshop}</Text> }
									<Input
								    	ref={this.namaPanggilanRef}
								    	name='namaPanggilan'
										placeholder='Masukan nama panggilan'
										label='Nama Panggilan'
										value={data.namaPanggilan}
										labelStyle={styles.label}
										onChangeText={(e) => this.onChangeText(e, this.namaPanggilanRef)}
										status={errorsState.namaPanggilan && 'danger'}
										size='small'
										onSubmitEditing={() => this.noHpRef.current.focus() }
									/>
									{ errorsState.namaPanggilan && <Text style={styles.labelErr}>{errorsState.namaPanggilan}</Text> }
									<Input
								    	ref={this.noHpRef}
										placeholder='628/08 XXXX'
										label='Nomor Hp'
										name='noHp'
										value={data.noHp}
										labelStyle={styles.label}
										onChangeText={(e) => this.onChangeText(e, this.noHpRef)}
										keyboardType='numeric'
										status={errorsState.noHp && 'danger'}
										size='small'
										onSubmitEditing={() => this.npwpRef.current.focus() }
									/>
									{ errorsState.noHp && <Text style={styles.labelErr}>{errorsState.noHp}</Text> }
									<Input
									  ref={this.npwpRef}
									  label='NPWP'
									  name='npwp'
									  labelStyle={styles.label}
									  placeholder='Masukan nomor NPWP'
									  value={data.npwp}
									  onChangeText={(e) => this.onChangeText(e, this.npwpRef)}
									  status={errorsState.npwp && 'danger'}
									  size='small'
									  onSubmitEditing={() => this.emailRef.current.focus() }
									/>
									{ errorsState.npwp && <Text style={styles.labelErr}>{errorsState.npwp}</Text> }
									<Input
									  ref={this.emailRef}
									  value={data.email}
									  name='email'
									  label='Email'
									  labelStyle={styles.label}
									  placeholder='example@example.com'
									  onChangeText={(e) => this.onChangeText(e, this.emailRef)}
									  size='small'
									  status={errorsState.email && 'danger'}
									  onSubmitEditing={() => this.imeiRef.current.focus() }
									/>
									 { errorsState.email && <Text style={styles.labelErr}>{errorsState.email}</Text> }
									<Input
									  ref={this.imeiRef}
									  value={data.imei}
									  label='IMEI phone'
									  name='imei'
									  placeholder='Masukan imei smartphone anda'
									  keyboardType='numeric'
									  labelStyle={styles.label}
									  onChangeText={(e) => this.onChangeText(e, this.imeiRef)}
									  status={errorsState.imei && 'danger'}
									  size='small'
									  onSubmitEditing={() => this.kodeposRef.current.focus() }
									/>
									{ errorsState.imei && <Text style={styles.labelErr}>{errorsState.imei}</Text> }
									<Input
									  ref={this.kodeposRef}
									  value={data.kodepos}
									  name='kodepos'
									  label='Kodepos'
									  placeholder='Masukan kodepos'
									  keyboardType='numeric'
									  labelStyle={styles.label}
									  onChangeText={(e) => this.onChangeText(e, this.kodeposRef)}
									  status={errorsState.kodepos && 'danger'}
									  size='small'
									/>
									{ errorsState.kodepos && <Text style={styles.labelErr}>{errorsState.kodepos}</Text> }
									<Select
								    	label='Kepercayaan'
								        data={kepercayaan}
								        labelStyle={styles.label}
								        placeholder='Pilih Kepercayaan'
								        onSelect={this.onSelectText}
								        status={errorsState.kepercayaan && 'danger'}
								    />
								    { errorsState.kepercayaan && <Text style={styles.labelErr}>{errorsState.kepercayaan}</Text> }
								    <Select
								    	label='Pekerjaan'
								        data={pekerjaan}
								        placeholder='Pilih Jenis Pekerjaan'
								        labelStyle={styles.label}
								        onSelect={this.onSelectText}
								        status={errorsState.pekerjaan && 'danger'}
								    />
								    { errorsState.pekerjaan && <Text style={styles.labelErr}>{errorsState.pekerjaan}</Text> }
								    <Select
								    	label='Status Perkawinan'
								        data={status}
								        placeholder='Pilih Status'
								        labelStyle={styles.label}
								        onSelect={this.onSelectText}
								        status={errorsState.status && 'danger'}
								    />
								    { errorsState.status && <Text style={styles.labelErr}>{errorsState.status}</Text> }
								    <Select
								    	label='Penghasilan'
								        data={penghasilan}
								        placeholder='Pilih penghasilan pertahun'
								        onSelect={this.onSelectText}
								        labelStyle={styles.label}
								        status={errorsState.penghasilan && 'danger'}
								    />
								    { errorsState.penghasilan && <Text style={styles.labelErr}>{errorsState.penghasilan}</Text> }
								    <Select
								    	label='Sumber Penghasilan'
								        data={sumber}
								        placeholder='Pilih Sumber Penghasilan'
								        labelStyle={styles.label}
								        onSelect={this.onSelectText}
								        status={errorsState.sumber && 'danger'}
								    />
								    { errorsState.sumber && <Text style={styles.labelErr}>{errorsState.sumber}</Text> }
								    <Select
								    	label='Tujuan'
								        data={tujuan}
								        placeholder='Pilih Tujuan Penggunaan Dana'
								        onSelect={this.onSelectText}
								        labelStyle={styles.label}
								        status={errorsState.tujuan && 'danger'}
								    />
								    { errorsState.tujuan && <Text style={styles.labelErr}>{errorsState.tujuan}</Text> }
									<Button 
										size='small' 
										style={styles.button}
										onPress={this.onSubmit}
									>Daftar</Button>
								</View> }
						</View> }
				</ScrollView>
				</KeyboardAvoidingView>
				{ Object.keys(errr2).length > 0 && 
					<Modal 
						loading={this.state.modal} 
						text={errr2.message} 
						handleClose={this.closeModal}
					/>}
			</SafeAreaView>
		);
	}
}

function mapStateToProps(state) {
	return{
		dataktp: state.register,
		errr: state.register.errors.ktp,
		errr2: state.register.errors.register
	}
}


export default connect(mapStateToProps, { registerKtp, removeError })(RegistrasiKtp);