# 출력 형식

WagSave는 여러 저장 백엔드를 지원합니다. 에디터 창의 **Save Output**에서 WagSave 에셋당 하나의 형식을 선택합니다. 형식을 전환할 때 코드 변경이 필요하지 않습니다.

---

## 사용 가능한 형식

### 파일 기반 형식

| 형식 | 인덱스 변형 | 설명 |
|---|---|---|
| Binary | 있음 | 압축적인 바이너리 직렬화. 출시에 권장됩니다. |
| JSON | 있음 | 사람이 읽을 수 있는 JSON. 개발 중에 권장됩니다. |
| Text | 있음 | 일반 텍스트 키-값 출력. |
| PlayerPrefs | 없음 | Unity의 내장 키-값 저장소. 설정 및 WebGL에 적합합니다. |

**인덱스 변형**은 저장 데이터를 여러 개의 인덱스된 파일로 분할합니다. 이렇게 하면 전체 저장 데이터를 로드하지 않고 부분적인 읽기 및 쓰기가 가능하여 대규모 저장 데이터셋의 성능이 향상됩니다.

### 클라우드 / 플랫폼 형식

| 형식 | 필요한 SDK | 설명 |
|---|---|---|
| Unity Cloud Save | Unity Gaming Services | Unity의 호스팅 클라우드 백엔드에 저장합니다. |
| Steam Cloud Save | Steamworks SDK | Steam Remote Storage를 통해 저장합니다. |

두 클라우드 형식 모두 **조건부 컴파일**됩니다. 필요한 SDK가 프로젝트에 없으면 드롭다운에 형식이 표시되지 않으며 컴파일 오류도 발생하지 않습니다.

---

## Unity Cloud Save 설정

Unity Cloud Save는 추가 패키지와 런타임에서의 일회성 초기화가 필요합니다. WagSave가 모든 스레드 처리를 자동으로 관리하므로 아래 단계 외에 추가 코드는 필요하지 않습니다.

### 1 — 필수 패키지 설치

**Window > Package Manager**를 열고 **Unity Registry**로 전환한 후 두 패키지를 모두 설치합니다:

| 패키지 | 패키지 ID |
|---|---|
| Authentication | `com.unity.services.authentication` |
| Cloud Save | `com.unity.services.cloudsave` |

`com.unity.services.core`는 의존성으로 자동 설치됩니다.

`com.unity.services.cloudsave`가 프로젝트에 존재하면 `CLOUD_SAVE_ENABLED` 스크립팅 심볼이 자동으로 활성화되고 형식 드롭다운에 **Unity Cloud Save** 옵션이 나타납니다. 심볼을 수동으로 설정할 필요가 없습니다.

### 2 — Unity Gaming Services에 프로젝트 연결

1. **Edit > Project Settings > Services**를 엽니다.
2. 로그인하고 Unity Cloud 프로젝트에 연결합니다 (필요한 경우 대시보드에서 생성).
3. 프로젝트 ID와 조직 ID가 프로젝트 설정에 기록됩니다.

### 3 — 런타임 초기화

**저장 또는 불러오기 작업 전에, 시작 시 한 번** 다음 코드를 호출합니다. `Start()` 메서드나 전용 부트스트래퍼가 적합한 위치입니다:

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;

private async void Start()
{
    await UnityServices.InitializeAsync();

    if (!AuthenticationService.Instance.IsSignedIn)
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
}
```

> `UnityServices.InitializeAsync()`가 완료되기 전에 저장 또는 불러오기가 시도되면 WagSave가 오류를 기록하고 작업이 실패합니다. 게임플레이를 시작하기 전에 항상 초기화를 기다리십시오.

`SignInAnonymouslyAsync`는 테스트에 적합합니다. 출시 게임에서는 선택한 로그인 방식(Steam, Google, Apple ID, 아이디/비밀번호 등)으로 교체하십시오.

### 4 — 형식 선택

WagSave 에디터 창에서 **Save Output**으로 이동하여 형식 드롭다운에서 **Unity Cloud Save**를 선택합니다.

### 참고 사항

- Cloud Save 데이터는 **인증된 플레이어별**로 저장됩니다. 각 플레이어는 독립된 데이터 버킷을 가집니다.
- WagSave는 모든 키에 내부적으로 네임스페이스 접두사를 붙이므로, 동일 프로젝트 내 여러 WagSave 에셋이 클라우드 버킷에서 충돌하지 않습니다.
- WagSave는 모든 Cloud Save 작업을 자동으로 메인 스레드에서 실행합니다. 추가적인 스레드 설정이 필요하지 않습니다.

---

## Steam Cloud Save 설정

Steam Cloud Save는 Steamworks.NET 패키지와 활성 Steam 세션이 필요합니다. 아래 설정이 완료되면 WagSave가 모든 Steam Remote Storage 호출을 자동으로 처리합니다.

### 1 — Steamworks 개발자 계정 및 앱 생성

1. [partner.steamgames.com](https://partner.steamgames.com)에서 계정을 등록합니다. Steam 배포 계약에 동의하고 $100의 앱 수수료를 납부해야 합니다(매출 $1,000 달성 후 환불).
2. Steamworks 파트너 대시보드에서 앱을 생성합니다. **App ID**가 발급됩니다.
3. Steamworks 대시보드에서 **App Admin → Cloud**로 이동하여 앱의 **Steam Cloud**를 활성화합니다. 저장 할당량을 설정합니다(기본값 1 GB / 1,000개 파일은 대부분의 게임에 충분합니다).

> 개발 중에는 본인의 App ID 대신 App ID `480`(Valve의 공개 테스트 앱 SpaceWar)을 사용할 수 있습니다.

### 2 — Steamworks.NET 설치

**Window > Package Manager**를 열고 **+**를 클릭하여 **Add package from git URL**을 선택한 뒤 입력합니다:

```
https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net
```

또는 [steamworks.github.io](https://steamworks.github.io)에서 `.unitypackage`를 다운로드하여 **Assets > Import Package**로 임포트합니다.

패키지가 존재하면 WagSave 어셈블리 정의에 의해 `STEAM_ENABLED` 스크립팅 심볼이 자동으로 활성화됩니다. 형식 드롭다운에 **Steam Cloud Save** 옵션이 나타납니다. 심볼을 수동으로 설정할 필요가 없습니다.

### 3 — steam_appid.txt 추가

프로젝트 루트(`Assets/` 폴더가 있는 폴더)에 `steam_appid.txt`라는 일반 텍스트 파일을 만듭니다. 내용은 App ID만 기입합니다:

```
480
```

배포 전에 `480`을 실제 App ID로 교체하세요. 이 파일은 Steam 외부에서 실행할 때 `SteamAPI.Init()`가 성공하기 위해 필요합니다.

### 4 — 런타임에서 SteamAPI 초기화

Steam 저장 대상은 저장 또는 불러오기 작업 전에 `SteamAPI.Init()` 호출이 필요합니다. Steamworks.NET에는 이 목적에 맞는 `SteamManager` 컴포넌트가 포함되어 있습니다.

1. 전체 Steamworks.NET `.unitypackage`를 임포트했다면 `SteamManager` 프리팹이 포함되어 있습니다 — 씬으로 드래그하세요.
2. Package Manager로 설치했다면 씬의 GameObject에 `SteamManager` 스크립트를 수동으로 추가하세요(소스는 [Steamworks.NET 저장소](https://github.com/rlabrecque/Steamworks.NET)에서 구할 수 있습니다).
3. WagSave의 저장 또는 불러오기가 실행되기 전에 초기화되도록 `SteamManager`를 씬 계층의 앞쪽에 배치하세요.

> 기기에서 Steam 클라이언트가 실행 중이어야 합니다. Steam이 실행 중이지 않으면 `SteamAPI.IsSteamRunning()`이 false를 반환하고 WagSave가 오류를 발생시킵니다.

### 5 — 저장 프로필 구성

1. Project 창에서 WagSave 에셋을 선택합니다.
2. Inspector에서 저장 프로필을 열거나 새로 만듭니다.
3. **Save Target Destination** 드롭다운을 **Steam Cloud Save**로 설정합니다.
4. **Target ID**를 설정합니다 — 이것이 Steam Cloud에 저장되는 파일명이 됩니다. 예를 들어 Target ID가 `slot1`이면 `slot1.wsav` 파일이 생성됩니다.

### 참고 사항

- 저장 파일은 `.wsav` 파일로 Steam Cloud에 저장되며 게임 종료 시 자동으로 동기화됩니다.
- Steam Cloud는 파일당 100 MB 크기 제한이 있습니다. 제한을 초과하면 오류가 기록됩니다.
- 데이터는 로그인된 Steam 계정에 연결됩니다. 각 Steam 사용자는 독립적인 클라우드 저장 공간을 가집니다.
- 모든 키는 저장 대상당 단일 파일에 저장됩니다. 여러 WagSave 에셋을 사용하는 경우 각각 고유한 Target ID를 부여하세요.

---

## 파일 속성

세이브 슬롯이 **비활성화**된 경우 모든 파일 기반 형식에 적용됩니다. **Save Output > File Properties**에서 설정합니다:

- **Folder** — `Application.persistentDataPath` 내의 하위 폴더 이름. 기본값은 WagSave 에셋 이름입니다.
- **Filename** — 저장 파일의 기본 이름.
- **Extension** — 파일 확장자 (예: `sav`, `dat`, `json`).

세이브 슬롯이 활성화된 경우 각 슬롯이 자체 파일 경로를 관리합니다. 폴더는 **Save Slots > Slots Folder**에서 설정합니다.

---

## 보호 옵션

**Save Output > Protection**에서 찾을 수 있습니다.

### 암호화

비대칭 (공개/개인 키) 암호화를 사용하여 저장 파일을 암호화합니다.

1. **Encrypt Data** 활성화 — WagSave가 키 쌍을 자동으로 생성합니다.
2. **개인 키**를 안전하게 보관합니다. 생성 시 대화 상자에 표시됩니다 — WagSave는 디스크에 저장하지 않습니다.
3. 다음 두 가지 방법 중 하나를 사용하여 런타임에 개인 키를 제공합니다:

   **옵션 A — 이벤트 (권장):** 첫 번째 저장 또는 불러오기 전에 `OnGetEncryptionPrivateKey`를 구독합니다:

   ```csharp
   wagSave.OnGetEncryptionPrivateKey += () => LoadPrivateKeyFromSecureStorage();
   ```

   **옵션 B — 직접 설정:** 인스턴스에 직접 키를 할당합니다:

   ```csharp
   wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = LoadPrivateKeyFromSecureStorage();
   ```

   이벤트 방식은 키 조회를 사용 시점까지 지연시킬 수 있어 권장됩니다. 두 방식 모두 유효합니다.

**Regenerate Keys**를 클릭하면 새 키 쌍이 발급됩니다. 재생성 후 **기존 저장 파일을 읽을 수 없게 됩니다**.

### 파일 서명

각 저장 파일에 암호화 서명을 추가합니다. WagSave는 불러올 때 서명을 확인하고 변조된 파일을 거부합니다.

1. **Sign Output File** 활성화 — 비밀 키가 생성되어 WagSave 에셋에 저장됩니다.
2. **Regenerate Key**를 클릭하면 새 서명 비밀이 발급됩니다. 기존 서명된 파일은 검증에 실패합니다.

> 서명은 변조와 파일 손상을 감지합니다. 파일 내용을 읽으려는 결연한 사용자를 막지는 못합니다 — 그것을 위해서는 암호화를 사용하세요.

### 저장 파일 백업

저장할 때마다 기존 저장 파일의 사본을 `.bak` 확장자로 만듭니다. 저장이 실패하면(암호화 오류, 디스크 쓰기 실패 등) 백업에서 이전 파일이 자동으로 복원되므로, 플레이어가 절반만 기록된 손상된 저장 파일을 만나는 일이 없습니다.

1. **Save Output > Protection**에서 **Backup Before Save**를 활성화합니다.
2. 백업은 데이터 파일과 같은 폴더에 동일한 이름 + `.bak`으로 기록됩니다.
3. 저장이 성공하면 백업은 자동으로 제거됩니다. 저장이 실패하면 점검을 위해 디스크에 그대로 남습니다.

> 인덱스 파일 형식에서는 사용할 수 없습니다. 인덱스 타깃은 저장마다 교체 파일을 생성하는 대신 데이터 파일에 점진적으로 직접 기록하므로, 저장 전 백업이 완전한 이전 상태를 나타낼 수 없습니다.

---

## 압축

**Save Output > Options**에서 **Compress Output**를 활성화하면 저장 파일을 쓰기 전에 압축을 적용합니다. 저장 및 불러오기 시 약간의 CPU 오버헤드를 대가로 파일 크기가 줄어듭니다. 저장 데이터가 클 때 권장됩니다.

---

## JSON Pretty Print

JSON 형식이 선택된 경우 **Pretty Print JSON**을 활성화합니다. 출력에 들여쓰기를 추가하여 디버깅을 위해 사람이 읽기 쉽게 만듭니다. 파일 크기가 증가하므로 출시 빌드에서는 비활성화해야 합니다.

---

## 진행률 UI

**Use Progress UI**를 활성화하면 저장 및 불러오기 작업 중에 내장 진행률 표시기 프리팹이 표시됩니다. 프리팹은 WagSave 에셋에서 참조됩니다. 다른 프리팹을 할당하여 자신만의 것으로 교체할 수 있습니다.

---

## 형식 선택 가이드

| 상황 | 권장 형식 |
|---|---|
| 데스크톱 또는 콘솔 게임 출시 | Binary |
| 저장 데이터 디버깅 | JSON |
| WebGL 또는 단순한 키-값 데이터 | PlayerPrefs |
| 서버 측 프로필이 있는 온라인 게임 | Unity Cloud Save |
| Steam 게임 | Steam Cloud Save |

---

## 형식 전환

에디터 창에서 형식을 변경하고 Play를 누릅니다. 코드 변경이 필요하지 않습니다. 이전 형식의 기존 저장 파일은 새 형식으로 읽을 수 없습니다 — 프로덕션에서 전환할 때는 저장 데이터를 지우거나 마이그레이션해야 합니다.
