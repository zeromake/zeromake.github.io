title: Android的aidl相互通信机制
date: 2016-01-03 13:42:01
tags: [Android,aidl,IBind]

## Service使用aidl的与Activity相互交互
#### 一、为什么要使用aidl
原因是当我们的Client和Service不是同一个进程时是无法直接使用的，而在android中进程间通讯的方法有Activity、Content Provider、Broadcast和Service。
其中Activity需要界面，隐式调用没有回调Broadcast的接收对象经常会重新被实例化，且以上两种都是通过intent传送。回调不能完成交互。
Content Provider则只提供数据，Service有aidl这门进程间调用函数的机制。
<!--more-->
### 二、普通单向aidl使用
需要一个Client和Service以及aidl接口，其中Client和Service是可以不在同一个应用中的。下面是aidl：IMyAidl.aidl
``` java
    package zero.aidldemo.aidl;

    interface IMyAidl {
        void show(String str);
    }
```
以上写完会在gen下同包名中生成与aidl文件相同的java文件打开后这个类中有一个抽象内部类Stub实现Binder和自身我们在Service中写一个继承这个Stub的内部类
Service：ServiceMain.java 把当前Service的class全名作为Action注册以便于其他进程调用。
``` java

	public class ServiceMain extends Service{
		public final static String SERVICE_CLASS_NAME = "zero.musicplay.service.ServiceMain";
	        //继承IMyAidl.Stub
	        private class MyAidl extends IMyAidl.Stub{
	    		@Override
			public void show(String str) throws RemoteException {
				Log.i("zerolog","ServiceMain_MyAidl_show="+str);
			}
	        }
	        @Override
	        public IBinder onBind(Intent intent) {
			return new ServiceBinder();
		}
	}
```

Client用一个Activity来实现:ActivityClient.java
``` java
public class ActivityClient extends Activity implements OnClickListener,ServiceConnection{
	//bind后的接口实现对象。
	private IMyAidl mAsInterface;
	//Service的Intent
	private Intent _intent;
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//界面加载和一个按键监听。。。
		setContentView(R.layout.activity_main);
		findViewById(R.id.btn1).setOnClickListener(this);
		//绑定Service
		Intent _intent=new Intent();
		_intent.setAction(ServiceMain.SERVICE_CLASS_NAME);
		//在4.多后具体哪个版本不记得了隐式bindService需要设置Service的包名。
		_intent.setPackage(getPackageName());
		//不知道是怎么回事现在我用api23编的如果不先startService就没法bindService不知道为什么。
		//statrtService(_intent);
		//第一个Intent，ServiceConnection对象，flags自己查api吧没懂什么用。
		bindService(_intent, this, 0);
	}
	@Override
	public void onClick(View v) {
		//bind是异步的防止mAsInterface还未获得而FC
		if (mAsInterface != null) {
			try {
				mAsInterface.show("MainActivity->show");
			} catch (RemoteException e) {
				e.printStackTrace();
			}
		}
	}
	@Override
	protected void onDestroy() {
		//记得解绑
		if(mAsInterface != null){
			unbindService(this);
			stopService(_intent);
		}
		super.onDestroy();
	}
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
    		mAsInterface = IMyAidl.Stub.asInterface(service);
    	}
    
    	@Override
    	public void onServiceDisconnected(ComponentName name) {
    	}
}
```
效果就是点击按钮触发Service里的实现接口函数。
### 三、双向aidl使用
单向的aidl接口中函数也可以有返回值，但是只适用于同步且时间较短。如果需要的函数执行的是一个异步任务就不好用了。
所以这里用双向aidl比较合适。

与上面相比多了一个aidl的回调先看回调的aidl:IMyAidlCallBack.aidl
``` java
    package zero.aidldemo.aidl;

    interface IMyAidlCallBack {
        void callBackShow();
    }
```
没什么变化但是在原来的调用Service的aidl中需要加入两个方法:IMyAidl.aidl方法名不是固定的
``` java
package zero.aidldemo.aidl;
//eclipse对aidl文件编辑支持比较差有时无法自动导包。
import zero.aidldemo.aidl.IMyAidlCallBack;
interface IMyAidl {
	void show(String str);
	//注册回调
	void registerCallback(IMyAidlCallBack cb);
	//解除回调
	void unregisterCallback(IMyAidlCallBack cb);
}
```
Service：ServiceMain.java 
``` java
public class ServiceMain extends Service {
	public final static String SERVICE_CLASS_NAME = "zero.musicplay.service.ServiceMain";
	// 回调列表对象
	private RemoteCallbackList<IMyAidlCallBack> mCallbackList;

	private class MyAidl extends IMyAidl.Stub {
		@Override
		public void show(String str) throws RemoteException {
			Log.i("zerolog", "ServiceMain_MyAidl_show=" + str);
			// 取出已绑定的回调对象个数并开始广播
			int conut = mCallbackList.beginBroadcast();
			for (int j = 0; j < conut; j++) {
				// 遍历调用回调方法。
				mCallbackList.getBroadcastItem(j).callBackShow();
			}
			// 解除回调广播。
			mCallbackList.finishBroadcast();
		}

		@Override
		public void registerCallback(IMyAidlCallBack cb) throws RemoteException {
			// 添加到回调列表中
			mCallbackList.register(cb);
		}

		@Override
		public void unregisterCallback(IMyAidlCallBack cb)
				throws RemoteException {
			// 从回调列表中移除
			mCallbackList.unregister(cb);
		}
	}

	@Override
	public void onCreate() {
		// 在服务被创建时实例化一个为空的回调列表对象
		mCallbackList = new RemoteCallbackList<IMyAidlCallBack>();
		super.onCreate();
	}

	@Override
	public IBinder onBind(Intent intent) {
		return new MyAidl();
	}
}
```
和上面说的一样在原有的aidl中添加两个方法用于给回调列表对象添加删除。并需要一个回调列表对象。
所以我在onCreate()实例化。

然后是Client:ActivityClient.java
``` java
public class ActivityClient extends Activity implements OnClickListener,
		ServiceConnection {
	// bind后的接口实现对象。
	private IMyAidl mAsInterface;
	// Service的Intent
	private Intent _intent;
	// 回调实现对象
	private MyCallBack mCallBack;

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		// 界面加载和一个按键监听。。。
		setContentView(R.layout.activity_main);
		findViewById(R.id.btn1).setOnClickListener(this);
		// 实例化回调实现
		mCallBack = new MyCallBack();
		// 绑定Service
		Intent _intent = new Intent();
		_intent.setAction(ServiceMain.SERVICE_CLASS_NAME);
		// 在4.+后具体哪个版本不记得了隐式bindService需要设置Service的包名。
		_intent.setPackage(getPackageName());
		// 不知道是怎么回事现在我用api23编的如果不先startService就没法bindService不知道为什么。
		// statrtService(_intent);
		// 第一个Intent，ServiceConnection对象，flags自己查api吧没懂什么用。
		bindService(_intent, this, 0);
	}

	@Override
	public void onClick(View v) {
		// bind是异步的防止mAsInterface还未获得而FC
		if (mAsInterface != null) {
			try {
				mAsInterface.show("MainActivity->show");
			} catch (RemoteException e) {
				e.printStackTrace();
			}
		}
	}

	@Override
	protected void onDestroy() {
		// 记得解绑
		if (mAsInterface != null) {
			try {
				mAsInterface.unregisterCallback(mCallBack);
			} catch (RemoteException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			unbindService(this);
			stopService(_intent);
		}
		super.onDestroy();
	}

	@Override
	public void onServiceConnected(ComponentName name, IBinder service) {
		mAsInterface = IMyAidl.Stub.asInterface(service);
		// 在绑定完成后将通过定义好的方法添加到Service的回调列表中
		try {
			mAsInterface.registerCallback(mCallBack);
		} catch (RemoteException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void onServiceDisconnected(ComponentName name) {
	}

	// 实现回调接口中的方法。
	private class MyCallBack extends IMyAidlCallBack.Stub {

		@Override
		public void callBackShow() throws RemoteException {
			Log.i("zerolog", "callBackShow");
			// 千万记住不能在这里再调用Service的aidl方法会报异常
			// java.lang.IllegalStateException: beginBroadcast() called while
			// already in a broadcast
			// mAsInterface.show("");
		}

	}
}
```
好了以上就是一个交互式的aidl小例子，回调可以在Service的任意地方调用不一定要在Service的aidl被调用时调用。
以及这些内部类也都可以提取出来，但是就不好访问Service和视图了。
### 四、注意
    1.回调对象的实现方法不能直接调用Service的aidl方法。可以用Handler来调用。
    2.如果发觉只用bindSrevice无法启动Service可以先startService再bindSrevice
### 五、例子源码
[度盘](http://pan.baidu.com/s/1mh1fO4S)
